// components/checkout/receiptPdf.js — builds and downloads the PDF receipt on the order
// confirmation page. jsPDF is loaded only when someone asks for the receipt.

// Helper: load image as base64 so jsPDF can embed it reliably
const loadImageAsBase64 = (url) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

// Throws if the PDF can't be built; the caller shows the error
export async function downloadReceipt(orderDetails, paymentProvider) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // ✅ Safe fallbacks for all fields
  const lineItems = orderDetails.cartItems || orderDetails.items || [];
  const regionName =
    orderDetails.region?.name || orderDetails.region || "N/A";
  const paymentRef = orderDetails.paymentReference || "N/A";
  const subTotal = Number(orderDetails.subTotal || 0);
  const deliveryFee = Number(orderDetails.deliveryFee || 0);
  const discount = Number(orderDetails.discount || 0);
  const total = Number(orderDetails.total || 0);

  // Watermark
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.setFontSize(60);
  doc.setTextColor(0, 67, 40);
  doc.text("FIL", pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 45,
  });
  doc.setGState(new doc.GState({ opacity: 1 }));

  // ✅ Load logo asynchronously (properly) — skip silently if fails
  const logoData = await loadImageAsBase64("/fillogo.png");
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", pageWidth / 2 - 20, 10, 40, 40);
    } catch (e) {
      console.warn("Logo embed failed:", e);
    }
  }

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 67, 40);
  doc.text("Fedan Investment Limited", pageWidth / 2, 58, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Think Quality, Think FIL", pageWidth / 2, 65, {
    align: "center",
  });

  doc.setDrawColor(0, 67, 40);
  doc.setLineWidth(0.5);
  doc.line(14, 70, pageWidth - 14, 70);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 51, 51);
  doc.text("ORDER RECEIPT", pageWidth / 2, 80, { align: "center" });

  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 88, pageWidth - 28, 16, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 67, 40);
  doc.text("Order Reference:", 18, 96);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 51, 51);
  doc.text(String(paymentRef), 58, 96);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 67, 40);
  doc.text("Date:", 18, 101);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 51, 51);
  doc.text(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    32,
    101
  );

  let yPos = 114;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 51, 51);
  doc.text("CUSTOMER INFORMATION", 14, yPos);
  yPos += 2;
  doc.setDrawColor(0, 67, 40);
  doc.setLineWidth(0.3);
  doc.line(14, yPos, 70, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const customerInfo = [
    {
      label: "Name:",
      value: `${orderDetails.firstName || ""} ${
        orderDetails.lastName || ""
      }`.trim(),
    },
    { label: "Email:", value: orderDetails.email || "N/A" },
    { label: "Phone:", value: orderDetails.phone || "N/A" },
    {
      label: "Address:",
      value: `${orderDetails.address || ""}, ${orderDetails.city || ""}`,
    },
    { label: "Region:", value: regionName },
    { label: "Delivery:", value: orderDetails.deliveryType || "N/A" },
  ];

  customerInfo.forEach((info) => {
    doc.setFont("helvetica", "bold");
    doc.text(info.label, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(String(info.value || ""), 40, yPos);
    yPos += 6;
  });

  yPos += 4;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 51, 51);
  doc.text("PAYMENT DETAILS", 14, yPos);
  yPos += 2;
  doc.setDrawColor(0, 67, 40);
  doc.line(14, yPos, 70, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("Payment Method:", 14, yPos);
  doc.setFont("helvetica", "normal");
  const paymentMethod = paymentProvider
    ? paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1)
    : "N/A";
  doc.text(paymentMethod, 50, yPos);
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 14, yPos);
  doc.setTextColor(0, 67, 40);
  doc.text("PAID", 50, yPos); // ✅ removed unicode checkmark (jsPDF can't render it without custom font)

  yPos += 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 51, 51);
  doc.text("ORDER ITEMS", 14, yPos);
  yPos += 2;
  doc.setDrawColor(0, 67, 40);
  doc.line(14, yPos, 70, yPos);

  // ✅ Use safe lineItems array
  const tableData = lineItems.map((item, i) => [
    String(i + 1),
    item.name || "Unknown Product",
    String(item.quantity || 1),
    `NGN ${Number(item.price || 0).toLocaleString()}`,
    `NGN ${(
      Number(item.price || 0) * Number(item.quantity || 1)
    ).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [["#", "Product", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [0, 67, 40],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
    },
    bodyStyles: { textColor: [51, 51, 51], fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 35 },
      4: { halign: "right", cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Summary box
  const summaryBoxHeight = 45;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(pageWidth - 90, finalY, 76, summaryBoxHeight, 3, 3, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const summaryY = finalY + 8;
  doc.text("Subtotal:", pageWidth - 85, summaryY);
  doc.text(`NGN ${subTotal.toLocaleString()}`, pageWidth - 20, summaryY, { align: "right" });
  doc.text("Delivery Fee:", pageWidth - 85, summaryY + 7);
  doc.text(`NGN ${deliveryFee.toLocaleString()}`, pageWidth - 20, summaryY + 7, { align: "right" });
  doc.text("Discount:", pageWidth - 85, summaryY + 14);
  doc.setTextColor(0, 67, 40);
  doc.text(`-NGN ${discount.toLocaleString()}`, pageWidth - 20, summaryY + 14, { align: "right" });
  doc.setDrawColor(0, 67, 40);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 85, summaryY + 18, pageWidth - 15, summaryY + 18);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 67, 40);
  doc.text("TOTAL:", pageWidth - 85, summaryY + 26);
  doc.setFontSize(14);
  doc.text(`NGN ${total.toLocaleString()}`, pageWidth - 20, summaryY + 26, { align: "right" });

  // ✅ Dynamic footer — add new page if not enough room
  const contentBottomY = finalY + summaryBoxHeight + 10;
  const footerHeight = 30; // space the footer needs
  const spaceLeft = pageHeight - contentBottomY;

  let footerY;
  if (spaceLeft < footerHeight + 10) {
    doc.addPage();
    footerY = 20; // near top of new page
  } else {
    footerY = contentBottomY + Math.max(0, spaceLeft - footerHeight - 10);
    // clamp so it doesn't float too high on short receipts
    footerY = Math.max(contentBottomY + 10, footerY);
  }

  doc.setDrawColor(0, 67, 40);
  doc.setLineWidth(0.3);
  doc.line(14, footerY, pageWidth - 14, footerY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for choosing FIL Store!", pageWidth / 2, footerY + 6, { align: "center" });
  doc.text(
    "For support: filfilecommerce@gmail.com | Visit: filstore.com.ng",
    pageWidth / 2,
    footerY + 11,
    { align: "center" }
  );
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    pageWidth / 2,
    footerY + 18,
    { align: "center" }
  );

  doc.save(`FIL-Receipt-${paymentRef}.pdf`);
}
