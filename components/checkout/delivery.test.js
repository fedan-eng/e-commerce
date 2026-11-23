import { describe, expect, it } from "vitest";
import { freeDeliveryBlock, isFreeDeliveryAvailable } from "./delivery";

// A normal day, so these don't change when Black Friday comes round
const DAY = new Date("2026-12-10T12:00:00+01:00");

describe("free delivery", () => {
  it("needs ₦10,000 and no promo code", () => {
    expect(isFreeDeliveryAvailable(10000, null, DAY)).toBe(true);
    expect(freeDeliveryBlock(9999, null, DAY)).toMatch(/₦10,000/);
  });

  it("is off with any promo code, whatever the order size", () => {
    for (const code of ["WELCOME10", "DAMMY10", "SALE5"]) {
      expect(isFreeDeliveryAvailable(500000, code, DAY)).toBe(false);
      expect(freeDeliveryBlock(500000, code, DAY)).toBe("Not available with promo codes");
    }
  });

  it("is off from 27 to 29 November (Lagos time)", () => {
    expect(isFreeDeliveryAvailable(50000, null, new Date("2026-11-26T23:59:00+01:00"))).toBe(true);
    expect(freeDeliveryBlock(50000, null, new Date("2026-11-27T00:00:00+01:00"))).toMatch(/Black Friday/);
    expect(isFreeDeliveryAvailable(50000, null, new Date("2026-11-29T23:59:00+01:00"))).toBe(false);
    expect(isFreeDeliveryAvailable(50000, null, new Date("2026-11-30T00:00:00+01:00"))).toBe(true);
  });
});
