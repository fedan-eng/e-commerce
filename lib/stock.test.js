import { describe, expect, it } from "vitest";
import { colorInStock, firstInStockColor, itemInStock, productInStock, soldOutColorNames } from "./stock";

const product = (overrides = {}) => ({
  availability: true,
  colors: [
    { name: "Black", inStock: false },
    { name: "White" },
    { name: "Blue", inStock: true },
  ],
  ...overrides,
});

describe("colorInStock", () => {
  it("treats a colour without the field as in stock", () => {
    expect(colorInStock({ name: "Black" })).toBe(true);
    expect(colorInStock({ name: "Black", inStock: false })).toBe(false);
  });
});

describe("productInStock", () => {
  it("is in stock when any colour is", () => {
    expect(productInStock(product())).toBe(true);
  });
  it("is out of stock when every colour is sold out", () => {
    expect(productInStock(product({ colors: [{ name: "Black", inStock: false }] }))).toBe(false);
  });
  it("follows the whole-product switch", () => {
    expect(productInStock(product({ availability: false }))).toBe(false);
    expect(productInStock({ colors: [] })).toBe(true);
    expect(productInStock({ availability: false, colors: [] })).toBe(false);
  });
});

describe("firstInStockColor", () => {
  it("skips sold-out colours", () => {
    expect(firstInStockColor(product()).name).toBe("White");
  });
  it("falls back to the first colour, or null", () => {
    expect(firstInStockColor({ colors: [{ name: "Black", inStock: false }] }).name).toBe("Black");
    expect(firstInStockColor({ colors: [] })).toBeNull();
  });
});

describe("itemInStock", () => {
  it("checks the chosen colour, ignoring case and spaces", () => {
    expect(itemInStock(product(), "black")).toBe(false);
    expect(itemInStock(product(), " White ")).toBe(true);
  });
  it("rejects everything when the product is switched off", () => {
    expect(itemInStock(product({ availability: false }), "White")).toBe(false);
  });
  it("falls back to the product when the colour is not listed", () => {
    expect(itemInStock(product(), "Green")).toBe(true);
  });
  it("without a colour, needs some colour in stock", () => {
    expect(itemInStock(product(), null)).toBe(true);
    expect(itemInStock(product({ colors: [{ name: "Black", inStock: false }] }), null)).toBe(false);
  });
});

describe("soldOutColorNames", () => {
  it("lists the sold-out colours", () => {
    expect(soldOutColorNames(product())).toEqual(["Black"]);
  });
});
