// Sample data for every email, used by scripts/email-preview.mjs. Returns [name, { subject, html, text }].
import { buildOrderStatusEmail, buildNewOrderAdminEmail, STATUS_EMAIL_KEYS } from "../lib/emails/orderEmails.js";
import { buildAbandonedCartEmail } from "../lib/emails/abandonedCartEmail.js";
import { buildReviewRequestEmail } from "../lib/emails/reviewRequestEmail.js";
import { buildWelcomeEmail } from "../lib/emails/welcomeEmail.js";
import { buildAccountCreatedEmail } from "../lib/emails/accountCreatedEmail.js";
import { buildSignInCodeEmail } from "../lib/emails/signInCodeEmail.js";
import { buildPasswordResetEmail, buildPasswordChangedEmail } from "../lib/emails/passwordEmails.js";
import {
  buildContactAdminEmail, buildContactReplyEmail, buildReturnRequestAdminEmail, buildFeedbackAdminEmail,
} from "../lib/emails/supportEmails.js";

const IMG = "https://www.filstore.com.ng/filpods.png";

const order = {
  _id: "6719f0c2a8b4e3d2c1f0a9b8",
  firstName: "Adaeze",
  lastName: "Okafor",
  email: "adaeze@example.com",
  phone: "0803 123 4567",
  addPhone: "0812 765 4321",
  address: "14 Adeola Odeku Street, Victoria Island",
  city: "Lagos",
  region: { name: "Lagos Island", fee: 2500 },
  deliveryType: "Express",
  orderNote: "Please call before delivery",
  items: [
    { name: "FIL Power Bank 20000mAh", quantity: 2, price: 15000, color: "Black", image: "/casebuds.png" },
    { name: "FIL Wireless Earbuds Pro", quantity: 1, price: 18500, color: "White", image: IMG },
  ],
  subTotal: 48500,
  deliveryFee: 2500,
  discount: 4850,
  promoCode: "WELCOME10",
  total: 46150,
  paymentReference: "T123456789012345",
  createdAt: new Date(),
};

// Quick checkout: email only, no delivery details
const quickOrder = { ...order, firstName: "", lastName: "", phone: "", addPhone: "", address: "", city: "", region: { name: "" }, orderNote: "", discount: 0, promoCode: null, total: 51000, items: order.items.map(({ image, ...i }) => i) };

export function emailSamples() {
  return [
    ...STATUS_EMAIL_KEYS.map((status) => [`order-${status}`, buildOrderStatusEmail(order, status)]),
    ["order-confirmed-quick-checkout", buildOrderStatusEmail(quickOrder, "confirmed")],
    ["admin-new-order", buildNewOrderAdminEmail(order)],
    ["cart-reminder", buildAbandonedCartEmail({ firstName: "Adaeze", items: order.items })],
    ["review-request", buildReviewRequestEmail({
      firstName: "Adaeze",
      isReminder: true,
      items: order.items.map((i) => ({ ...i, link: "https://www.filstore.com.ng/review?token=sample" })),
    })],
    ["account-welcome", buildWelcomeEmail({ firstName: "Adaeze" })],
    ["account-created", buildAccountCreatedEmail({ email: "adaeze@example.com", password: "Fil#k82mQa", code: "482913", link: "https://www.filstore.com.ng/verify-email?token=sample" })],
    ["account-sign-in-code", buildSignInCodeEmail({ code: "731520" })],
    ["account-password-reset", buildPasswordResetEmail({ firstName: "Adaeze", code: "590214", link: "https://www.filstore.com.ng/reset-password/token?token=sample" })],
    ["account-password-reset-done", buildPasswordChangedEmail({ firstName: "Adaeze", reset: true })],
    ["account-password-changed", buildPasswordChangedEmail({ firstName: "Adaeze" })],
    ["support-contact-reply", buildContactReplyEmail({ inquiryType: "redress", name: "Adaeze", orderId: order._id, question: "My earbuds' left side stopped charging after two days.\nCan I get a replacement?" })],
    ["admin-contact", buildContactAdminEmail({ inquiryType: "redress", name: "Adaeze Okafor", email: "adaeze@example.com", orderId: order._id, productName: "FIL Wireless Earbuds Pro", productImage: IMG, reason: "Faulty product", attachmentCount: 2, question: "My earbuds' left side stopped charging after two days.\nCan I get a replacement? <b>not bold</b>" })],
    ["admin-return", buildReturnRequestAdminEmail({ orderId: order._id, productName: "FIL Wireless Earbuds Pro", productImage: IMG, productPrice: 18500, returnQuantity: 1, productCondition: "Opened, faulty", reasonForReturn: "Left earbud won't charge.", phone: order.phone, address: order.address, city: "Lagos", region: "Lagos Island", amount: 18500, bankName: "GTBank", accountNumber: "0123456789", accountName: "Adaeze Okafor" })],
    ["admin-feedback", buildFeedbackAdminEmail({ rating: 4, comment: "Checkout was quick. Would love more colour options." })],
  ];
}
