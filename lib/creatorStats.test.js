import { describe, expect, it, vi } from "vitest";

vi.mock("@/models/Order", () => ({ default: {} }));
vi.mock("@/models/ReferralEvent", () => ({ default: {} }));
vi.mock("@/models/CreatorPayout", () => ({ default: {} }));
const { buildCreatorDashboard, orderState, firstNameOnly, linkPipeline } = await import("./creatorStats");

const order = (o) => ({
  _id: "64b000000000000000000001", createdAt: new Date("2026-10-10T10:00:00Z"), firstName: "Tolu Adebayo",
  email: "tolu@example.com", subTotal: 20000, discount: 2000, status: "delivered", paymentStatus: "paid",
  credit: "DAMMY10", viaLink: false, creatorCode: "DAMMY10", commissionPercent: 10,
  items: [{ name: "MagFlex", quantity: 1 }], ...o,
});

describe("orderState", () => {
  it("earns only once paid and delivered", () => {
    expect(orderState({ status: "delivered", paymentStatus: "paid" })).toBe("earned");
    expect(orderState({ status: "shipped", paymentStatus: "paid" })).toBe("pending");
    expect(orderState({ status: "delivered", paymentStatus: "pending" })).toBe("pending");
  });

  it("drops cancelled, returned and failed orders", () => {
    expect(orderState({ status: "cancelled", paymentStatus: "paid" })).toBe("void");
    expect(orderState({ status: "Returned" })).toBe("void");
    expect(orderState({ status: "confirmed", paymentStatus: "failed" })).toBe("void");
  });
});

describe("firstNameOnly", () => {
  it("keeps the first word and nothing else", () => {
    expect(firstNameOnly("  Tolu  Adebayo ")).toBe("Tolu");
    expect(firstNameOnly("")).toBe("Customer");
  });
});

describe("buildCreatorDashboard", () => {
  const rates = { DAMMY10: 10 };

  it("counts a customer once however many items they buy", () => {
    const { summary } = buildCreatorDashboard(
      [order({ items: [{ name: "A", quantity: 2 }, { name: "B", quantity: 1 }, { name: "C", quantity: 1 }] })],
      { rates }
    );
    expect(summary).toMatchObject({ customers: 1, orders: 1, units: 4 });
  });

  it("counts the same buyer's repeat orders as one customer", () => {
    const { summary } = buildCreatorDashboard(
      [order({ _id: "a" }), order({ _id: "b", email: "TOLU@example.com" }), order({ _id: "c", email: "ada@example.com" })],
      { rates }
    );
    expect(summary).toMatchObject({ customers: 2, orders: 3 });
  });

  it("splits commission into earned and pending, and ignores void orders", () => {
    const { summary, balance, orders } = buildCreatorDashboard(
      [order({ _id: "a" }), order({ _id: "b", status: "shipped" }), order({ _id: "c", status: "cancelled" })],
      { rates }
    );
    // 10% of 18,000 (subtotal after discount) each
    expect(summary).toMatchObject({ earned: 1800, pending: 1800, orders: 2, cancelled: 1, sales: 36000 });
    expect(balance).toMatchObject({ earned: 1800, pending: 1800 });
    expect(orders.find((o) => o.id === "c")).toMatchObject({ state: "void", commission: 0 });
  });

  it("keeps the rate an order was placed under, falling back to today's rate for older orders", () => {
    const { orders } = buildCreatorDashboard(
      [order({ _id: "a", commissionPercent: 5 }), order({ _id: "b", creatorCode: null, commissionPercent: null })],
      { rates: { DAMMY10: 15 } }
    );
    expect(orders.map((o) => [o.rate, o.commission])).toEqual([[5, 900], [15, 2700]]);
  });

  it("uses today's rate when the saved one was for a different creator", () => {
    const { orders } = buildCreatorDashboard([order({ creatorCode: "OTHER", commissionPercent: 50 })], { rates });
    expect(orders[0].rate).toBe(10);
  });

  it("subtracts payouts from all-time earnings, whatever the date range", () => {
    const { balance, summary } = buildCreatorDashboard([order()], {
      rates, payouts: [{ amount: 1000 }], from: new Date("2026-10-20"),
    });
    expect(summary.orders).toBe(0);
    expect(balance).toEqual({ earned: 1800, pending: 0, paidOut: 1000, owed: 800 });
  });

  it("never sends the buyer's email or surname", () => {
    const { orders } = buildCreatorDashboard([order({ viaLink: true, discount: 0 })], { rates });
    expect(orders[0]).toMatchObject({ customer: "Tolu", via: "link", discount: 0 });
    expect(JSON.stringify(orders)).not.toMatch(/tolu@|Adebayo/);
  });

  it("counts link buyers separately from people who typed the code", () => {
    const { summary } = buildCreatorDashboard(
      [
        order({ _id: "a", viaLink: true }),
        order({ _id: "b", viaLink: true }), // same person again
        order({ _id: "c", viaLink: true, email: "ada@example.com", status: "cancelled" }),
        order({ _id: "d", email: "bayo@example.com" }),
      ],
      { rates }
    );
    expect(summary).toMatchObject({ orders: 3, customers: 2, linkOrders: 2, linkCustomers: 1 });
  });
});

describe("linkPipeline", () => {
  it("looks only at the creator's codes in the date range, as one total", () => {
    const from = new Date("2026-10-01");
    const [match, group] = linkPipeline({ codes: ["DAMMY10", "DAMMY5"], from, to: null });
    expect(match.$match).toEqual({ code: { $in: ["DAMMY10", "DAMMY5"] }, createdAt: { $gte: from } });
    expect(group.$group._id).toBeNull();
  });
});
