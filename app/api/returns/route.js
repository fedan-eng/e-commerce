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

    const returnEmailHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; width:100%; background-color:#f0f0f0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100;">

  <!-- Outer wrapper table for full-width background -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;">
    <tr>
      <td align="center" style="padding:20px 10px;">

        <!-- Main container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#dc3545; padding:35px 30px; text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    <div style="font-size:40px; line-height:1;">&#x1F504;</div>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center; padding-top:12px;">
                    <h1 style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:24px; font-weight:700; color:#ffffff; letter-spacing:0.5px;">Return Request Initiated</h1>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center; padding-top:8px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#ffcccc;">New return request requires your attention</p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center; padding-top:15px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="background-color:#ffc107; color:#333333; padding:6px 18px; border-radius:20px; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; font-weight:700; letter-spacing:0.5px;">
                          &#x26A0;&#xFE0F; ACTION REQUIRED
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:30px 25px; background-color:#ffffff;">

              <!-- Intro text -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:25px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; color:#555555; line-height:1.6;">
                      A customer has initiated a return request. Please review the details below and process accordingly.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order Information Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8f9fa; border-left:4px solid #dc3545; border-radius:0 8px 8px 0; padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:15px; border-bottom:2px solid #e9ecef;">
                          <h2 style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#333333;">
                            &#x1F4E6; Order Information
                          </h2>
                        </td>
                      </tr>
                      <!-- Order ID -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Order ID</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:700; color:#333333; text-align:right;">${orderId}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Product Name -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Product</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${productName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Product Price -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Unit Price</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#333333; text-align:right;">&#x20A6;${Number(productPrice).toLocaleString()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Return Quantity -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Return Qty</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${returnQuantity}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Product Condition -->
                      <tr>
                        <td style="padding:12px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Condition</td>
                              <td style="text-align:right;">
                                <span style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; font-weight:600; color:#856404; background-color:#fff3cd; padding:4px 12px; border-radius:12px;">${productCondition}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Reason for Return -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#fff8e1; border:2px solid #ffe082; border-radius:8px; padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <h3 style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#6d5603;">
                            &#x1F4DD; Reason for Return
                          </h3>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; color:#6d5603; font-style:italic; line-height:1.6; background-color:#fffde7; padding:12px; border-radius:6px;">
                            &ldquo;${reasonForReturn}&rdquo;
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Customer Details Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8f9fa; border-left:4px solid #007bff; border-radius:0 8px 8px 0; padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:15px; border-bottom:2px solid #e9ecef;">
                          <h2 style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#333333;">
                            &#x1F464; Customer Details
                          </h2>
                        </td>
                      </tr>
                      <!-- Phone -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Phone</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${phone}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Address -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%; vertical-align:top;">Address</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${address}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- City -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">City</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${city}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Region -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid #e9ecef;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Region</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#333333; text-align:right;">${region}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Amount Paid -->
                      <tr>
                        <td style="padding:12px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#666666; width:40%;">Amount Paid</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#333333; text-align:right;">&#x20A6;${Number(amount).toLocaleString()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Refund Details Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#1a8754; border-radius:10px; padding:25px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:15px; border-bottom:2px solid rgba(255,255,255,0.2);">
                          <h2 style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#ffffff;">
                            &#x1F4B0; Refund Bank Details
                          </h2>
                        </td>
                      </tr>
                      <!-- Bank Name -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.15);">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#b8e6cc; width:40%;">Bank Name</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#ffffff; text-align:right;">${bankName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Account Number -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.15);">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#b8e6cc; width:40%;">Account No.</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:15px; font-weight:700; color:#ffffff; text-align:right; letter-spacing:1px;">${accountNumber}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Account Name -->
                      <tr>
                        <td style="padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.15);">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#b8e6cc; width:40%;">Account Name</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#ffffff; text-align:right;">${accountName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Refund Amount -->
                      <tr>
                        <td style="padding:15px 0 5px 0;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-weight:600; color:#b8e6cc; width:40%;">Refund Amount</td>
                              <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:22px; font-weight:700; color:#ffffff; text-align:right;">&#x20A6;${Number(amount).toLocaleString()}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#e8f4fd; border-left:4px solid #2196f3; border-radius:0 8px 8px 0; padding:20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <h3 style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:14px; font-weight:700; color:#1565c0;">
                            &#x23F0; Next Steps
                          </h3>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; color:#1565c0; line-height:2;">
                          1. Review the return request details<br>
                          2. Contact the customer if needed<br>
                          3. Arrange product pickup/return<br>
                          4. Process refund once product is received and verified
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Timestamp -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-top:20px; border-top:1px solid #e9ecef; text-align:center;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; color:#999999;">
                      Submitted on ${new Date().toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#2d2d2d; padding:30px 25px; text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="text-align:center; padding-bottom:8px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:16px; font-weight:700; color:#ffffff;">FIL Store Admin</p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center; padding-bottom:15px;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:13px; font-style:italic; color:#1cc978;">Think Quality, Think FIL.</p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; font-size:12px; color:#999999;">
                      Manage orders at
                      <a href="https://filstore.com.ng/admin" style="color:#1cc978; text-decoration:underline;">Admin Dashboard</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;

    const plainText = `
RETURN REQUEST INITIATED
================================

ORDER INFORMATION
--------------------------------
Order ID: ${orderId}
Product: ${productName}
Price: NGN ${Number(productPrice).toLocaleString()}
Return Quantity: ${returnQuantity}
Condition: ${productCondition}

REASON FOR RETURN
--------------------------------
"${reasonForReturn}"

CUSTOMER DETAILS
--------------------------------
Phone: ${phone}
Address: ${address}
City: ${city}
Region: ${region}
Amount Paid: NGN ${Number(amount).toLocaleString()}

REFUND DETAILS
--------------------------------
Bank: ${bankName}
Account Number: ${accountNumber}
Account Name: ${accountName}
Refund Amount: NGN ${Number(amount).toLocaleString()}

NEXT STEPS:
- Review the return request details
- Contact the customer if needed
- Arrange product pickup/return
- Process refund once product is received and verified

================================
Submitted: ${new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}

FIL Store Admin
Think Quality, Think FIL.
    `.trim();

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `Return Request - Order #${orderId}`,
      plainText,
      returnEmailHtml
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