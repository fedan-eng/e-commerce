// lib/invoice.js
// Builds order PDFs in the browser: invoices in the admin console, and the same design as the
// shopper's receipt on the order confirmation page (components/checkout/receiptPdf.js).
// jsPDF is loaded on demand so it never weighs down page loads.

const PINE = [15, 71, 43];
const INK = [17, 24, 20];
const FAINT = [107, 117, 112];

const naira = n => "NGN " + (Number(n) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const shortId = id => String(id || "").slice(-8).toUpperCase();
const lineTotal = it => (parseFloat(it.price) || 0) * (parseInt(it.quantity, 10) || 1);

const titleCase = s => String(s || "").replace(/^\w/, c => c.toUpperCase());

// kind: "invoice" (admin) or "receipt" (shopper, just paid)
function drawInvoice(doc, autoTable, order, { kind = "invoice", paymentMethod } = {}) {
  const isReceipt = kind === "receipt";
  const number = order._id ? shortId(order._id) : String(order.paymentReference || "").toUpperCase();
  const pageWidth = doc.internal.pageSize.width;
  const right = pageWidth - 14;
  const name = [order.firstName, order.lastName].filter(Boolean).join(" ") || "Customer";
  const date = new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // Header band
  doc.setFillColor(...PINE);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Fedan Investment Limited", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Think Quality, Think FIL · filstore.com.ng", 14, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(isReceipt ? "RECEIPT" : "INVOICE", right, 17, { align: "right" });

  // Invoice meta
  doc.setTextColor(...FAINT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(isReceipt ? "Receipt no." : "Invoice no.", 14, 40);
  doc.text("Date", 70, 40);
  doc.text("Status", 120, 40);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`#${number}`, 14, 46);
  doc.text(date, 70, 46);
  doc.text(isReceipt ? "Paid" : titleCase(order.status), 120, 46);

  // Bill to
  doc.setTextColor(...FAINT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Bill to", 14, 58);
  doc.setTextColor(...INK);
  doc.setFontSize(10);
  const billTo = [
    name,
    order.email,
    order.phone ? String(order.phone).replace(/^(\d{10})$/, "0$1") : null,
    order.address,
    [order.city, order.region?.name || (typeof order.region === "string" ? order.region : "")].filter(Boolean).join(", "),
  ].filter(Boolean);
  billTo.forEach((line, i) => doc.text(String(line), 14, 64 + i * 5));

  // Items
  autoTable(doc, {
    startY: 64 + billTo.length * 5 + 6,
    head: [["Item", "Colour", "Qty", "Unit price", "Amount"]],
    body: (order.items || []).map(it => [
      it.name || "Item",
      it.color || "—",
      String(parseInt(it.quantity, 10) || 1),
      naira(it.price),
      naira(lineTotal(it)),
    ]),
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: INK },
    headStyles: { fillColor: [244, 246, 245], textColor: FAINT, fontStyle: "bold" },
    columnStyles: { 2: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  // Totals
  const subTotal = order.subTotal != null ? order.subTotal : (order.items || []).reduce((a, it) => a + lineTotal(it), 0);
  const total = order.total != null ? order.total : subTotal;
  const rows = [["Subtotal", naira(subTotal)]];
  if (order.deliveryFee != null) rows.push(["Delivery", order.deliveryFee ? naira(order.deliveryFee) : "Free"]);
  if (order.discount > 0) rows.push([`Discount${order.promoCode ? ` (${order.promoCode})` : ""}`, "- " + naira(order.discount)]);

  let y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  rows.forEach(([label, value]) => {
    doc.setTextColor(...FAINT);
    doc.setFont("helvetica", "normal");
    doc.text(label, right - 60, y);
    doc.setTextColor(...INK);
    doc.text(value, right, y, { align: "right" });
    y += 6;
  });
  doc.setDrawColor(230, 233, 231);
  doc.line(right - 60, y - 2, right, y - 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...PINE);
  doc.text("Total", right - 60, y + 5);
  doc.text(naira(total), right, y + 5, { align: "right" });

  // Payment
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...FAINT);
  const method = paymentMethod || order.paymentMethod;
  const payment = [
    method && `Payment method: ${titleCase(method)}`,
    order.paymentReference && `Reference: ${order.paymentReference}`,
    isReceipt && order.deliveryType && `Delivery: ${order.deliveryType}`,
  ].filter(Boolean);
  payment.forEach((line, i) => doc.text(line, 14, y + 5 + i * 5));

  const bottom = doc.internal.pageSize.height;
  doc.text("Thank you for shopping with FIL.", pageWidth / 2, bottom - (isReceipt ? 17 : 12), { align: "center" });
  if (isReceipt) doc.text("Questions? filfilecommerce@gmail.com · filstore.com.ng", pageWidth / 2, bottom - 12, { align: "center" });
}

async function loadPdf() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  return { jsPDF, autoTable };
}

// One order → fil-invoice-XXXXXXXX.pdf
export async function downloadInvoice(order) {
  return downloadInvoices([order]);
}

// Several orders → one PDF, an invoice per page
export async function downloadInvoices(orders) {
  if (!orders?.length) return;
  const { jsPDF, autoTable } = await loadPdf();
  const doc = new jsPDF();
  orders.forEach((order, i) => {
    if (i) doc.addPage();
    drawInvoice(doc, autoTable, order);
  });
  doc.save(orders.length === 1 ? `fil-invoice-${shortId(orders[0]._id)}.pdf` : `fil-invoices-${orders.length}.pdf`);
}

// The shopper's copy after paying → fil-receipt-XXXXXXXX.pdf. Accepts the saved order or the
// checkout data the confirmation page falls back to (cartItems, no _id).
export async function downloadReceipt(order, paymentMethod) {
  const { jsPDF, autoTable } = await loadPdf();
  const doc = new jsPDF();
  const normalised = { ...order, items: order.items?.length ? order.items : order.cartItems || [] };
  drawInvoice(doc, autoTable, normalised, { kind: "receipt", paymentMethod });
  doc.save(`fil-receipt-${normalised._id ? shortId(normalised._id) : normalised.paymentReference || "order"}.pdf`);
}
