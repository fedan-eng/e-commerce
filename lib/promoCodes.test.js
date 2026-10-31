import { describe, expect, it, vi } from "vitest";

vi.mock("@/models/Order", () => ({ default: {} }));
const { parsePromoBody, toClient } = await import("./promoCodes");

const base = { code: "dammy10", discount: "10" };

describe("parsePromoBody", () => {
  it("uppercases new codes and fills defaults", () => {
    const { data, error } = parsePromoBody(base, { isNew: true });
    expect(error).toBeUndefined();
    expect(data).toMatchObject({
      code: "DAMMY10", discount: 10, minCartValue: 0, maxUses: 0, expiresAt: null,
      active: true, type: "general", creatorName: "", commissionPercent: 0,
    });
  });

  it("rejects bad codes and discounts", () => {
    expect(parsePromoBody({ ...base, code: "a b" }, { isNew: true }).error).toMatch(/Code/);
    expect(parsePromoBody({ ...base, discount: "0" }, { isNew: true }).error).toMatch(/Discount/);
    expect(parsePromoBody({ ...base, discount: "" }, { isNew: true }).error).toMatch(/Discount/);
    expect(parsePromoBody({ ...base, maxUses: "1.5" }, { isNew: true }).error).toMatch(/Usage limit/);
  });

  it("needs a name for creator codes and keeps their commission", () => {
    expect(parsePromoBody({ ...base, type: "creator" }, { isNew: true }).error).toMatch(/creator's name/);
    const { data } = parsePromoBody(
      { ...base, type: "creator", creatorName: " Dammy ", creatorHandle: "@dammy", commissionPercent: "5" },
      { isNew: true }
    );
    expect(data).toMatchObject({ type: "creator", creatorName: "Dammy", creatorHandle: "@dammy", commissionPercent: 5 });
  });

  it("clears creator fields when a code becomes general", () => {
    const { data } = parsePromoBody({ ...base, type: "general", creatorName: "Dammy", commissionPercent: "5" }, { isNew: false });
    expect(data).toMatchObject({ creatorName: "", commissionPercent: 0 });
  });

  it("never renames an existing code", () => {
    expect(parsePromoBody({ ...base, code: "OTHER" }, { isNew: false }).data.code).toBeUndefined();
  });
});

describe("toClient", () => {
  it("normalises values saved as text by hand", () => {
    const c = toClient({ _id: "1", code: "WELCOME10", discount: 10, expiresAt: "null", maxUses: "0", firstPurchaseOnly: true });
    expect(c).toMatchObject({ expiresAt: null, maxUses: 0, active: true, type: "general", firstPurchaseOnly: true });
  });
});
