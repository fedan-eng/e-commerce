import { beforeEach, describe, expect, it, vi } from "vitest";

let pendingDoc = null;
const sendEmail = vi.fn();
vi.mock("@/models/PendingCheckout", () => ({ default: { findOne: () => ({ lean: () => ({ catch: async () => pendingDoc }) }) } }));
vi.mock("@/lib/mailer", () => ({ sendEmail: (...args) => sendEmail(...args) }));
const { parseMetadata, loadCheckout, orderFieldsFrom, alertUnsavedOrder } = await import("./paystackOrder");
const { hasEmoji, stripEmoji } = await import("./sanitize");

const checkout = {
  referralCode: null,
  cartItems: [{ _id: "p1", name: "Powerbank", price: "16000", quantity: "1", color: "black" }],
  deliveryInfo: {
    firstName: "Ada", lastName: "Obi", email: "ada@icloud.com", phone: "07064366034", addPhone: "",
    region: { name: "Lagos Mainland", fee: 3000 }, city: "Surulere", address: "No 23, Aguda", orderNote: "Pls call me",
    deliveryType: "Regular",
  },
  subTotal: 16000, discount: 0, deliveryFee: 3000, total: 19000, userId: null, gaClientId: null,
};

// The real metadata from the lost order: a string cut off in the middle of the order note
const truncated = JSON.stringify(checkout).replace(/Pls call me".*$/, "Pls call me ");

beforeEach(() => {
  pendingDoc = null;
  sendEmail.mockReset();
});

describe("parseMetadata", () => {
  it("keeps objects, parses JSON strings and rejects truncated strings", () => {
    expect(parseMetadata(checkout)).toBe(checkout);
    expect(parseMetadata(JSON.stringify(checkout))).toEqual(checkout);
    expect(parseMetadata(truncated)).toBeNull();
    expect(parseMetadata(null)).toBeNull();
  });
});

describe("loadCheckout", () => {
  it("uses the saved checkout even when Paystack's metadata is truncated", async () => {
    pendingDoc = { data: checkout };
    const result = await loadCheckout("FIL-1", truncated);
    expect(result).toEqual({ source: "pending", data: checkout });
  });

  it("falls back to metadata, then to nothing", async () => {
    expect((await loadCheckout("old", checkout)).source).toBe("metadata");
    expect(await loadCheckout("old", truncated)).toEqual({ source: "none", data: {} });
  });
});

describe("orderFieldsFrom", () => {
  it("builds a complete order", () => {
    const o = orderFieldsFrom(checkout, { reference: "FIL-1", amount: 19000 });
    expect(o).toMatchObject({
      firstName: "Ada", email: "ada@icloud.com", phone: "07064366034", city: "Surulere",
      region: { name: "Lagos Mainland", fee: 3000 }, total: 19000, paymentReference: "FIL-1", status: "confirmed",
    });
    expect(o.items[0]).toMatchObject({ price: 16000, quantity: 1 });
  });

  it("supports the old flat metadata and uses the signed-in user as a fallback", () => {
    const flat = { ...checkout.deliveryInfo, region: "Lagos Island", cartItems: [], total: 0 };
    const o = orderFieldsFrom(flat, { reference: "r", amount: 500, fallbackUserId: "u1" });
    expect(o).toMatchObject({ firstName: "Ada", region: { name: "Lagos Island" }, total: 500, userId: "u1" });
  });
});

describe("alertUnsavedOrder", () => {
  it("emails the admin with the reference and customer email", async () => {
    await alertUnsavedOrder({
      reference: "FIL-1", source: "none", error: new Error("Order validation failed"),
      paystackData: { amount: 1900000, customer: { email: "ada@icloud.com" }, metadata: truncated },
    });
    const [, subject, text] = sendEmail.mock.calls[0];
    expect(subject).toContain("FIL-1");
    expect(text).toContain("ada@icloud.com");
    expect(text).toContain("NGN 19000");
  });
});

describe("emoji detection", () => {
  it.each(["Pls call me 🙏", "📞 me", "❤️", "👍🏽", "🇳🇬", "1️⃣"])("flags %s", (v) => expect(hasEmoji(v)).toBe(true));
  it.each(["No23, Sholabumi, Aguda — Surulere", "Pls call me (before 5pm)", "Ọlá Adébáyọ̀", "£5 & 50% off", ""])(
    "allows %s",
    (v) => expect(hasEmoji(v)).toBe(false)
  );
  it("strips emojis", () => expect(stripEmoji("Pls call me 🙏🏽 asap ❤️")).toBe("Pls call me  asap "));
});
