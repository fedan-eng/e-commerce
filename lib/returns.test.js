import { describe, it, expect } from "vitest";
import { getDeliveredAt, getReturnDeadline, isReturnOpen } from "./returns";

const day = (s) => new Date(`${s}T12:00:00`);

describe("return window", () => {
  it("is closed until the order is delivered", () => {
    const order = { status: "intransit", statusHistory: [{ status: "intransit", date: day("2026-10-20") }] };
    expect(getReturnDeadline(order)).toBeNull();
    expect(isReturnOpen(order, day("2026-10-21"))).toBe(false);
  });

  it("counts 7 days from delivery, whatever the status casing", () => {
    for (const status of ["delivered", "Delivered"]) {
      const order = { status, statusHistory: [{ status: "confirmed", date: day("2026-10-01") }, { status, date: day("2026-10-10") }] };
      expect(getDeliveredAt(order)).toEqual(day("2026-10-10"));
      expect(isReturnOpen(order, new Date("2026-10-17T23:00:00"))).toBe(true);
      expect(isReturnOpen(order, day("2026-10-18"))).toBe(false);
    }
  });

  it("uses the latest delivered entry", () => {
    const order = {
      status: "delivered",
      statusHistory: [
        { status: "delivered", date: day("2026-10-01") },
        { status: "processing", date: day("2026-10-03") },
        { status: "delivered", date: day("2026-10-12") },
      ],
    };
    expect(getDeliveredAt(order)).toEqual(day("2026-10-12"));
  });

  it("falls back to the last history date for old delivered orders", () => {
    const order = { status: "delivered", statusHistory: [{ status: "confirmed", date: day("2026-10-05") }] };
    expect(getDeliveredAt(order)).toEqual(day("2026-10-05"));
  });

  it("never opens for cancelled or returned orders", () => {
    const order = { status: "returned", statusHistory: [{ status: "delivered", date: day("2026-10-20") }] };
    expect(isReturnOpen(order, day("2026-10-21"))).toBe(false);
  });
});
