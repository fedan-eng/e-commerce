// components/checkout/receiptPdf.js — the receipt on the order confirmation page. Same design
// as the admin console's invoices (lib/invoice.js), titled RECEIPT and marked Paid.
import { downloadReceipt as drawReceipt } from "@/lib/invoice";

// Throws if the PDF can't be built; the caller shows the error
export function downloadReceipt(orderDetails, paymentProvider) {
  return drawReceipt(orderDetails, paymentProvider);
}
