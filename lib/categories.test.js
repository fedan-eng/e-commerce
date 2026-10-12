import { describe, expect, it } from "vitest";
import { CATEGORIES, filterProducts, getSpecFields, getCategoryByDbName } from "./categories";

const chargers = CATEGORIES.chargers;
const powerBanks = CATEGORIES["power-banks"];

describe("filterProducts", () => {
  const products = [
    { _id: "a", price: 5000, specs: { outputW: 20, ports: ["USB-C"], chargingType: "wall" } },
    { _id: "b", price: 12000, specs: { outputW: 65, ports: ["USB-C", "USB-A"], chargingType: "desktop" } },
    { _id: "c", price: 40000 }, // no specs yet
  ];
  const ids = (list) => list.map((p) => p._id);

  it("returns everything when nothing is selected", () => {
    expect(ids(filterProducts(products, chargers, {}))).toEqual(["a", "b", "c"]);
  });

  it("matches numeric ranges", () => {
    expect(ids(filterProducts(products, chargers, { output: ["65-100"] }))).toEqual(["b"]);
  });

  it("ORs options within a group and ANDs across groups", () => {
    expect(ids(filterProducts(products, chargers, { output: ["below-65", "65-100"] }))).toEqual(["a", "b"]);
    expect(ids(filterProducts(products, chargers, { output: ["below-65", "65-100"], type: ["desktop"] }))).toEqual(["b"]);
  });

  it("handles the 'has all' option (USB-C and USB-A)", () => {
    expect(ids(filterProducts(products, chargers, { ports: ["USB-C+USB-A"] }))).toEqual(["b"]);
    expect(ids(filterProducts(products, chargers, { ports: ["USB-C"] }))).toEqual(["a", "b"]);
  });

  it("matches single-string spec fields", () => {
    expect(ids(filterProducts(products, chargers, { type: ["wall"] }))).toEqual(["a"]);
  });
});

describe("admin helpers", () => {
  it("finds categories case-insensitively", () => {
    expect(getCategoryByDbName("chargers")?.slug).toBe("chargers");
    expect(getCategoryByDbName("Accessories")).toBeNull();
  });

  it("derives spec inputs from the category filters", () => {
    const fields = getSpecFields("Chargers");
    expect(fields.map((f) => f.name)).toEqual(["outputW", "compatibility", "ports", "chargingType", "portCount"]);
    expect(fields.find((f) => f.name === "chargingType").kind).toBe("select");
    expect(fields.find((f) => f.name === "outputW")).toMatchObject({ kind: "number", unit: "W" });
    // The "USB-C and USB-A" combo is a filter-only option
    expect(fields.find((f) => f.name === "ports").options.map((o) => o.id)).toEqual(["USB-C", "USB-A"]);
  });

  it("has no unconfigured filter groups", () => {
    for (const cat of Object.values(CATEGORIES)) {
      for (const f of cat.filters) expect(f.options.length, `${cat.slug}.${f.key}`).toBeGreaterThan(0);
    }
    expect(getSpecFields(powerBanks.dbCategory).length).toBeGreaterThan(0);
  });
});
