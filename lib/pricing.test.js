import { describe, expect, it, vi } from "vitest";

vi.mock("@/models/Product", () => ({ default: {} }));
vi.mock("@/models/DeliveryRegion", () => ({
  default: { findOne: () => ({ lean: async () => ({ region: "Lagos Mainland", fee: 2500 }) }) },
}));
const { deliveryFeeFor } = await import("./pricing");

describe("deliveryFeeFor (what /api/paystack charges)", () => {
  it("allows free delivery without a code", async () => {
    expect(await deliveryFeeFor("Free", "Lagos Mainland", 20000)).toMatchObject({ fee: 0 });
  });

  it("refuses free delivery when any code comes with the order", async () => {
    expect(await deliveryFeeFor("Free", "Lagos Mainland", 20000, "WELCOME10")).toEqual({
      error: "Free delivery isn't available with promo codes",
    });
  });

  it("leaves paid delivery alone", async () => {
    expect(await deliveryFeeFor("Regular", "Lagos Mainland", 20000, "WELCOME10")).toMatchObject({ fee: 2500 });
    expect(await deliveryFeeFor("Express", "Lagos Mainland", 20000, "WELCOME10")).toMatchObject({ fee: 5000 });
  });
});
