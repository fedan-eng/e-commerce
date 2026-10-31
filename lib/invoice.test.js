import { describe, expect, it, vi } from "vitest";

const texts = [];
const saved = [];
vi.mock("jspdf", () => ({
  default: class {
    constructor() {
      this.internal = { pageSize: { width: 210, height: 297 } };
      this.lastAutoTable = { finalY: 120 };
    }
    text(t) { texts.push(String(t)); }
    save(name) { saved.push(name); }
    setFillColor() {} rect() {} setTextColor() {} setFont() {} setFontSize() {} setDrawColor() {} line() {} addPage() {}
  },
}));
const tables = [];
vi.mock("jspdf-autotable", () => ({ default: (doc, opts) => tables.push(opts) }));
const { downloadReceipt, downloadInvoice } = await import("./invoice");

const order = {
  _id: "64b0000000000000abcd1234", createdAt: "2026-10-29T10:00:00Z", firstName: "Tolu", lastName: "Ade",
  email: "tolu@gmail.com", phone: 8137678990, address: "1 Allen Ave", city: "Ikeja", region: { name: "Lagos Mainland" },
  items: [{ name: "MagFlex", color: "Black", quantity: 2, price: 15000 }], subTotal: 30000, deliveryFee: 2500,
  discount: 3000, promoCode: "DAMMY10", total: 29500, status: "confirmed", paymentReference: "ref_123", deliveryType: "Regular",
};

describe("receipt", () => {
  it("uses the invoice design, titled RECEIPT and marked Paid", async () => {
    texts.length = 0;
    await downloadReceipt(order, "paystack");
    expect(texts).toEqual(expect.arrayContaining([
      "Fedan Investment Limited", "RECEIPT", "Receipt no.", "#ABCD1234", "Paid", "Total", "NGN 29,500.00",
      "Discount (DAMMY10)", "Payment method: Paystack", "Delivery: Regular", "08137678990",
    ]));
    expect(texts).not.toContain("INVOICE");
    expect(tables.at(-1).body).toEqual([["MagFlex", "Black", "2", "NGN 15,000.00", "NGN 30,000.00"]]);
    expect(saved.at(-1)).toBe("fil-receipt-ABCD1234.pdf");
  });

  it("works from the checkout data when the order isn't back yet", async () => {
    texts.length = 0;
    const { _id, items, ...rest } = order;
    await downloadReceipt({ ...rest, cartItems: items, region: "Lagos Mainland" }, "paystack");
    expect(texts).toEqual(expect.arrayContaining(["#REF_123", "Ikeja, Lagos Mainland"]));
    expect(saved.at(-1)).toBe("fil-receipt-ref_123.pdf");
  });

  it("leaves the admin invoice as it was", async () => {
    texts.length = 0;
    await downloadInvoice(order);
    expect(texts).toEqual(expect.arrayContaining(["INVOICE", "Invoice no.", "Confirmed"]));
    expect(saved.at(-1)).toBe("fil-invoice-ABCD1234.pdf");
  });
});
