import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/mailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      productCondition,
      returnQuantity,
      reasonForReturn,
      bankName,
      accountNumber,
      accountName,
      amount,
      address,
      region,
      city,
      phone,
      orderId,
      productName,
      productPrice,
    } = body;

    // Validate input
    if (
      !productCondition ||
      !returnQuantity ||
      !reasonForReturn ||
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const mailOptions = {
      text: `
        Order ID: ${orderId}
        Product: ${productName}
        Price: ${productPrice}
        Condition: ${productCondition}
        Return Quantity: ${returnQuantity}
        Reason: ${reasonForReturn}

        Customer Details:
        Amount Paid: ${amount}
        Address: ${address}
        Region: ${region}
        City: ${city}
        Phone: ${phone}

        Refund Details:
        Bank: ${bankName}
        Account Number: ${accountNumber}
        Account Name: ${accountName}
      `,
    };

    await sendEmail(
      process.env.ADMIN_EMAIL,
      "Return Request Initiated",
      mailOptions.text
    );

    return NextResponse.json({ message: "Return request sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error sending return request" },
      { status: 500 }
    );
  }
}
