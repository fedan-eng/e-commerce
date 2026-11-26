import { describe, expect, it } from "vitest";
import { applyDeals, dealPrice } from "./deals";
import { cartPieceCount, cartSavings, promoEligibleSubtotal, dealText, cartItemExtras, dealGift, flashDealPill, flashDealSavings, discountDealPricing } from "./bundles";

const deal = (over) => ({ _id: "d1", title: "35% off MagSnap", type: "discount", percent: 35, gift: "", products: ["p1"], quota: 30, claimed: 0, ...over });

describe("applyDeals", () => {
  it("prices discount units at the deal price and keeps the normal price as originalPrice", () => {
    const [line] = applyDeals([{ _id: "p1", price: 20000, quantity: 2 }], [deal()]);
    expect(line.price).toBe(dealPrice(20000, 35));
    expect(line.originalPrice).toBe(20000);
    expect(line.deal).toMatchObject({ id: "d1", type: "discount", percent: 35, units: 2 });
  });

  it("splits a line when fewer units are left than were ordered", () => {
    const lines = applyDeals([{ _id: "p1", price: 20000, quantity: 3 }], [deal({ claimed: 29 })]);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ quantity: 1, price: 13000 });
    expect(lines[1]).toMatchObject({ quantity: 2, price: 20000 });
    expect(lines[1].deal).toBeUndefined();
  });

  it("shares one quota between the products of a deal", () => {
    const d = deal({ type: "gift", percent: undefined, gift: "charger and cord", products: ["a", "b"], quota: 10, claimed: 8 });
    const lines = applyDeals([{ _id: "a", price: 5000, quantity: 1 }, { _id: "b", price: 7000, quantity: 2 }], [d]);
    expect(lines.map((l) => [l._id, l.quantity, l.deal?.units ?? 0, l.price])).toEqual([
      ["a", 1, 1, 5000],
      ["b", 1, 1, 7000],
      ["b", 1, 0, 7000],
    ]);
  });

  it("leaves bundles and other products alone", () => {
    const items = [{ _id: "p1", isBundle: true, price: 29500, quantity: 1 }, { _id: "x", price: 100, quantity: 1 }];
    expect(applyDeals(items, [deal()])).toEqual(items);
  });
});

describe("cart sums", () => {
  const cart = [
    { _id: "b", price: 29500, originalPrice: 38000, quantity: 1, bundle: { count: 3, highlights: [] } },
    { _id: "s", price: 13000, originalPrice: 20000, quantity: 1, deal: { type: "discount", percent: 35 } },
    { _id: "g", price: 15000, quantity: 2, deal: { type: "gift", gift: "cord" } },
  ];

  it("counts a bundle as its pieces", () => expect(cartPieceCount(cart)).toBe(6));
  it("works out the savings", () => expect(cartSavings(cart)).toEqual({ full: 88000, savings: 15500 }));
  it("only lets promo codes take money off items that aren't already a deal", () => expect(promoEligibleSubtotal(cart)).toBe(30000));
  it("labels deal lines", () => {
    expect(dealText(cart[2])).toBe("Free cord included");
    expect(dealText(cart[1])).toBe("Black Friday −35%");
  });
  it("gives cart items the deal price when added", () => {
    const extras = cartItemExtras({ _id: "s", price: 20000 }, { id: "d1", title: "35% off", type: "discount", percent: 35 });
    expect(extras).toMatchObject({ price: 13000, originalPrice: 20000, deal: { id: "d1", percent: 35 } });
  });
});

describe("flash deal lines", () => {
  it("adds the gift product to a gift deal's cart extras", () => {
    const d = { _id: "d2", title: "Free cord with MagFlex", type: "gift", gift: "cord", giftProduct: { _id: "c1", name: "FIL cord", image: "/cord.png" } };
    const extras = cartItemExtras({ _id: "m", price: 22000 }, d);
    expect(extras.deal.giftProduct).toEqual({ _id: "c1", name: "FIL cord", image: "/cord.png" });
    expect(extras.price).toBeUndefined();
  });

  it("shows the gift on its own row, falling back to the gift's name", () => {
    expect(dealGift({ deal: { type: "gift", gift: "cord", giftProduct: { _id: "c1", name: "FIL cord", image: "" } } })).toMatchObject({ name: "FIL cord" });
    expect(dealGift({ deal: { type: "gift", gift: "Free cord" } }).image).toMatch(/r2\.dev/);
    expect(dealGift({ deal: { type: "gift", gift: "charger and cord" } })).toMatchObject({ name: "FIL charger and cord", image: "" });
    expect(dealGift({ deal: { type: "discount", percent: 50 } })).toBeNull();
  });

  it("labels discount lines and adds up only flash deal savings", () => {
    const items = [
      { price: 10000, originalPrice: 20000, quantity: 1, deal: { type: "discount", percent: 50 } },
      { price: 29500, originalPrice: 38000, quantity: 1, bundle: { count: 3 } },
      { price: 22000, quantity: 1, deal: { type: "gift", gift: "cord" } },
    ];
    expect(flashDealPill(items[0])).toBe("Flash deal −50%");
    expect(flashDealPill(items[2])).toBe("");
    expect(flashDealSavings(items)).toBe(10000);
  });
});

describe("a % off deal on a product that already has a 'was' price", () => {
  it("comes off the original price: 50% off Pulse 3 (₦25,000, was ₦30,000) is ₦15,000 against ₦30,000", () => {
    const pulse = { _id: "p3", price: 25000, originalPrice: 30000 };
    const d = deal({ _id: "d50", percent: 50, products: ["p3"] });
    const [line] = applyDeals([{ ...pulse, quantity: 1 }], [d]);
    expect(line).toMatchObject({ price: 15000, originalPrice: 30000 });
    expect(flashDealSavings([line])).toBe(15000);
    expect(cartItemExtras(pulse, { ...d, id: "d50" })).toMatchObject({ price: 15000, originalPrice: 30000 });
  });

  it("35% off MagSafe (₦16,000, was ₦23,000) is ₦14,950, and never dearer than today's price", () => {
    expect(discountDealPricing({ price: 16000, originalPrice: 23000 }, 35)).toEqual({ price: 14950, originalPrice: 23000 });
    expect(discountDealPricing({ price: 10000, originalPrice: 40000 }, 10)).toEqual({ price: 10000, originalPrice: 40000 });
    expect(discountDealPricing({ price: 20000 }, 35)).toEqual({ price: 13000, originalPrice: 20000 });
  });
});
