import { describe, expect, it } from "vitest";
import { freeDeliveryBlock, isFreeDeliveryAvailable } from "./delivery";

describe("free delivery", () => {
  it("needs ₦10,000 and no promo code", () => {
    expect(isFreeDeliveryAvailable(10000)).toBe(true);
    expect(freeDeliveryBlock(9999, null)).toMatch(/₦10,000/);
  });

  it("is off with any promo code, whatever the order size", () => {
    for (const code of ["WELCOME10", "DAMMY10", "SALE5"]) {
      expect(isFreeDeliveryAvailable(500000, code)).toBe(false);
      expect(freeDeliveryBlock(500000, code)).toBe("Not available with promo codes");
    }
  });
});
