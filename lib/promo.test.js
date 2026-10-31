import { beforeEach, describe, expect, it, vi } from "vitest";

let promoDoc;
let userDoc;
const orderExists = vi.fn();
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));
vi.mock("@/lib/auth", () => ({ verifyToken: () => null }));
vi.mock("@/models/PromoCode", () => ({ default: { findOne: () => ({ collation: async () => promoDoc }) } }));
vi.mock("@/models/User", () => ({ default: { findById: () => ({ select: async () => userDoc }) } }));
vi.mock("@/models/Order", () => ({ default: { exists: (q) => orderExists(q) } }));
const { validatePromo, phoneVariants } = await import("./promo");

const welcome = { code: "WELCOME10", discount: 10, minCartValue: 0, maxUses: 0, usedCount: 0, firstPurchaseOnly: true };
// Orders on file, matched the way Mongo would for the queries validatePromo makes
let orders;
const matches = (o, q) => Object.entries(q).every(([k, v]) => {
  if (k === "$or") return v.some((sub) => matches(o, sub));
  if (v && typeof v === "object" && "$in" in v) return v.$in.includes(o[k]);
  return String(o[k]) === String(v);
});

beforeEach(() => {
  promoDoc = { ...welcome };
  userDoc = { _id: "u1", email: "new@gmail.com", phone: "" };
  orders = [];
  orderExists.mockReset().mockImplementation(async (q) => orders.some((o) => matches(o, q)));
});

describe("phoneVariants", () => {
  it("matches how checkout saves Nigerian numbers", () => {
    expect(phoneVariants("08137678990")).toEqual([8137678990, 2348137678990]);
    expect(phoneVariants("+234 813 767 8990")).toEqual([8137678990, 2348137678990]);
    expect(phoneVariants(8137678990)).toEqual([8137678990, 2348137678990]);
    expect(phoneVariants("")).toEqual([]);
  });
});

describe("validatePromo: one welcome discount per person", () => {
  const check = (extra) => validatePromo({ code: "welcome10", userId: "u1", cartValue: 20000, ...extra });

  it("works for a genuinely new customer", async () => {
    expect(await check({ phone: "08137678990", email: "new@gmail.com" })).toMatchObject({ valid: true, amount: 2000 });
  });

  it("refuses a new email when that phone has ordered before", async () => {
    orders = [{ userId: "old", email: "tolu1@gmail.com", phone: 8137678990 }];
    const r = await check({ phone: "+2348137678990", email: "new@gmail.com" });
    expect(r).toEqual({ valid: false, status: 400, message: "This code is only for your first order" });
    expect(r.message).not.toMatch(/phone/i);
  });

  it("also uses the phone saved on their account", async () => {
    userDoc.phone = "08137678990";
    orders = [{ userId: "old", email: "x@gmail.com", phone: 2348137678990 }];
    expect((await check({})).valid).toBe(false);
  });

  it("refuses temporary inboxes, on the account or typed at checkout", async () => {
    userDoc.email = "tolu7@yopmail.com";
    expect(await check({})).toMatchObject({ valid: false, message: expect.stringMatching(/temporary email/) });
    userDoc.email = "new@gmail.com";
    expect((await check({ email: "tolu7@mailinator.com" })).valid).toBe(false);
  });

  it("leaves ordinary codes alone", async () => {
    promoDoc = { ...welcome, code: "SALE5", firstPurchaseOnly: false };
    userDoc.email = "tolu7@yopmail.com";
    orders = [{ userId: "u1", phone: 8137678990 }];
    expect((await check({ code: "SALE5", phone: "08137678990" })).valid).toBe(true);
  });

  it("once-per-person codes check the phone against that code only", async () => {
    promoDoc = { ...welcome, code: "ONCE", firstPurchaseOnly: false, oneTimePerUser: true };
    orders = [{ userId: "old", phone: 8137678990, promoCode: "OTHER" }];
    expect((await check({ code: "ONCE", phone: "08137678990" })).valid).toBe(true);
    orders.push({ userId: "old2", phone: 8137678990, promoCode: "ONCE" });
    expect(await check({ code: "ONCE", phone: "08137678990" })).toMatchObject({ valid: false, message: "You've already used this code" });
  });
});
