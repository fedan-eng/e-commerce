import { describe, it, expect } from "vitest";
import {
  canRequest, contactMatches, generateCode, isFinal, maskAccount, nextActions, normalizeCode, stageOf, statusesOf,
} from "./returnRefund";

const day = (s) => new Date(`${s}T12:00:00`);
const delivered = (date) => ({ status: "delivered", statusHistory: [{ status: "delivered", date: day(date) }] });

describe("request codes", () => {
  it("are prefixed by type and read back in any typing", () => {
    const code = generateCode("return", () => 0);
    expect(code).toBe("RT-AAAAAA");
    expect(normalizeCode(" rt aaaaaa ")).toBe("RT-AAAAAA");
    expect(normalizeCode("rf7k3f9q")).toBe("RF-7K3F9Q");
  });

  it("rejects look-alike characters and wrong lengths", () => {
    expect(normalizeCode("RT-7K3F90")).toBe(""); // 0 isn't used
    expect(normalizeCode("RT-7K3F9")).toBe("");
    expect(normalizeCode("XX-7K3F9Q")).toBe("");
  });
});

describe("flows", () => {
  it("refunds go requested → approved → refunded", () => {
    expect(nextActions("refund", "requested").map((a) => a.to)).toEqual(["approved", "rejected"]);
    expect(nextActions("refund", "approved").map((a) => a.to)).toEqual(["refunded"]);
    expect(nextActions("refund", "refunded")).toEqual([]);
    expect(statusesOf("refund")).not.toContain("outfordelivery");
  });

  it("returns end at returned, after going out for delivery", () => {
    expect(nextActions("return", "processing").map((a) => a.to)).toEqual(["outfordelivery"]);
    expect(nextActions("return", "outfordelivery").map((a) => a.to)).toEqual(["returned"]);
    expect(isFinal("return", "returned")).toBe(true);
    expect(isFinal("return", "outfordelivery")).toBe(false);
  });

  it("sorts statuses into the admin tabs", () => {
    expect(stageOf("return", "requested")).toBe("new");
    expect(stageOf("return", "received")).toBe("active");
    expect(stageOf("refund", "refunded")).toBe("closed");
    expect(stageOf("refund", "rejected")).toBe("closed");
  });
});

describe("tracking access", () => {
  const request = { email: "Ada@Example.com", phone: "8031234567" };

  it("matches the order's email in any case, or its phone in any format", () => {
    expect(contactMatches(request, "ada@example.com")).toBe(true);
    expect(contactMatches(request, "0803 123 4567")).toBe(true);
    expect(contactMatches(request, "+2348031234567")).toBe(true);
  });

  it("refuses anything else", () => {
    expect(contactMatches(request, "")).toBe(false);
    expect(contactMatches(request, "4567")).toBe(false);
    expect(contactMatches(request, "other@example.com")).toBe(false);
    expect(contactMatches({ email: "", phone: "" }, "@")).toBe(false);
  });

  it("masks account numbers", () => {
    expect(maskAccount("0123456789")).toBe("••••6789");
    expect(maskAccount("")).toBe("");
  });
});

describe("who can open one", () => {
  it("returns only within 7 days of delivery", () => {
    expect(canRequest("return", delivered("2026-10-10"), day("2026-10-16"))).toBe(true);
    expect(canRequest("return", delivered("2026-10-10"), day("2026-10-20"))).toBe(false);
    expect(canRequest("return", { status: "shipped", statusHistory: [] })).toBe(false);
  });

  it("refunds before delivery, or within the same window after", () => {
    expect(canRequest("refund", { status: "cancelled", statusHistory: [] })).toBe(true);
    expect(canRequest("refund", { status: "processing", statusHistory: [] })).toBe(true);
    expect(canRequest("refund", delivered("2026-10-10"), day("2026-10-16"))).toBe(true);
    expect(canRequest("refund", delivered("2026-10-10"), day("2026-10-20"))).toBe(false);
  });

  it("never refunds unpaid orders", () => {
    expect(canRequest("refund", { status: "confirmed", paymentStatus: "pending", statusHistory: [] })).toBe(false);
  });
});
