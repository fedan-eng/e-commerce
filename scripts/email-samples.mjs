// Sample data for every email, used by scripts/email-preview.mjs. Returns [name, { subject, html, text }].
import { buildOrderStatusEmail, buildNewOrderAdminEmail, STATUS_EMAIL_KEYS } from "../lib/emails/orderEmails.js";
import { buildAbandonedCartEmail, buildQuickQuestionCartEmail } from "../lib/emails/abandonedCartEmail.js";
import { buildSecondWelcomeEmail } from "../lib/emails/secondWelcomeEmail.js";
import { buildSalesReportEmail } from "../lib/emails/salesReportEmail.js";
import { buildReviewRequestEmail } from "../lib/emails/reviewRequestEmail.js";
import { buildWelcomeEmail } from "../lib/emails/welcomeEmail.js";
import { buildAccountCreatedEmail } from "../lib/emails/accountCreatedEmail.js";
import { buildCreatorLinkedEmail } from "../lib/emails/creatorLinkedEmail.js";
import { buildSignInCodeEmail } from "../lib/emails/signInCodeEmail.js";
import { buildPasswordResetEmail, buildPasswordChangedEmail } from "../lib/emails/passwordEmails.js";
import {
  buildContactAdminEmail, buildContactReplyEmail, buildRequestAdminEmail, buildRequestStatusEmail, buildFeedbackAdminEmail,
} from "../lib/emails/supportEmails.js";

const IMG = "https://www.filstore.com.ng/filpods.png";
const TRACK_URL = "https://www.filstore.com.ng/track?code=RF-7K3F9Q&key=sample";

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

const refundRequest = {
  _id: "671a0b3c9d8e7f6a5b4c3d2e",
  code: "RF-7K3F9Q",
  type: "refund",
  status: "requested",
  orderId: order._id,
  item: { name: "FIL Wireless Earbuds Pro", image: IMG, color: "White", price: 18500 },
  quantity: 1,
  reason: "Left earbud won't charge.\nTried two cables.",
  condition: "",
  firstName: "Adaeze",
  lastName: "Okafor",
  email: "adaeze@example.com",
  phone: order.phone,
  address: "", city: "", region: "",
  bank: { bankName: "GTBank", accountNumber: "0123456789", accountName: "Adaeze Okafor" },
  amount: 18500,
  refundedAmount: null,
  refundReference: "",
  customerNote: "",
  createdAt: new Date(),
};
const returnRequest = {
  ...refundRequest,
  _id: "671a0b3c9d8e7f6a5b4c3d2f",
  code: "RT-M4XP2D",
  type: "return",
  condition: "Opened, faulty",
  address: order.address, city: "Lagos", region: "Lagos Island",
  bank: { bankName: "", accountNumber: "", accountName: "" },
  amount: 0,
};

export function emailSamples() {
  return [
    ...STATUS_EMAIL_KEYS.map((status) => [`order-${status}`, buildOrderStatusEmail(order, status)]),
    ["order-confirmed-quick-checkout", buildOrderStatusEmail(quickOrder, "confirmed")],
    ["admin-new-order", buildNewOrderAdminEmail(order)],
    ["cart-reminder", buildAbandonedCartEmail({ firstName: "Adaeze", items: order.items })],
    ["cart-quick-question", buildQuickQuestionCartEmail({ firstName: "Adaeze", items: order.items })],
    ["review-request", buildReviewRequestEmail({
      firstName: "Adaeze",
      isReminder: true,
      items: order.items.map((i) => ({ ...i, link: "https://www.filstore.com.ng/review?token=sample" })),
    })],
    ["account-welcome", buildWelcomeEmail({ firstName: "Adaeze" })],
    ["account-second-welcome", buildSecondWelcomeEmail({ firstName: "Adaeze" })],
    ["account-created", buildAccountCreatedEmail({ email: "adaeze@example.com", password: "Fil#k82mQa", code: "482913", link: "https://www.filstore.com.ng/verify-email?token=sample" })],
    ["account-creator-linked", buildCreatorLinkedEmail({ firstName: "Dammy", code: "DAMMY10", discount: 10, commissionPercent: 5 })],
    ["account-sign-in-code", buildSignInCodeEmail({ code: "731520" })],
    ["account-password-reset", buildPasswordResetEmail({ firstName: "Adaeze", code: "590214", link: "https://www.filstore.com.ng/reset-password/token?token=sample" })],
    ["account-password-reset-done", buildPasswordChangedEmail({ firstName: "Adaeze", reset: true })],
    ["account-password-changed", buildPasswordChangedEmail({ firstName: "Adaeze" })],
    ["support-contact-reply", buildContactReplyEmail({ inquiryType: "redress", name: "Adaeze", orderId: order._id, question: "My earbuds' left side stopped charging after two days.\nCan I get a replacement?" })],
    ["admin-contact", buildContactAdminEmail({ inquiryType: "redress", name: "Adaeze Okafor", email: "adaeze@example.com", orderId: order._id, productName: "FIL Wireless Earbuds Pro", productImage: IMG, reason: "Faulty product", attachmentCount: 2, question: "My earbuds' left side stopped charging after two days.\nCan I get a replacement? <b>not bold</b>" })],
    ["admin-refund-request", buildRequestAdminEmail(refundRequest)],
    ["admin-return-request", buildRequestAdminEmail(returnRequest)],
    ["support-refund-requested", buildRequestStatusEmail(refundRequest, TRACK_URL)],
    ["support-refund-refunded", buildRequestStatusEmail({ ...refundRequest, status: "refunded", refundedAmount: 18500, refundReference: "GTB-88213409", customerNote: "Sent from our GTBank account." }, TRACK_URL)],
    ["support-return-requested", buildRequestStatusEmail(returnRequest, TRACK_URL)],
    ["support-return-out-for-delivery", buildRequestStatusEmail({ ...returnRequest, status: "outfordelivery", customerNote: "Fixed and tested. Our rider will call before arriving." }, TRACK_URL)],
    ["support-return-declined", buildRequestStatusEmail({ ...returnRequest, status: "rejected", customerNote: "The item shows water damage, which the warranty doesn't cover." }, TRACK_URL)],
    ["admin-sales-report", buildSalesReportEmail({
      from: new Date(Date.now() - 86400000),
      to: new Date(),
      payments: [{ name: "Adaeze Okafor", phone: "08031234567", email: "adaeze@example.com", items: order.items, value: 46150, at: new Date(), note: "Left the payment page" }],
      carts: [{ name: "", phone: "", email: "tunde@example.com", items: order.items.slice(1), value: 18500, at: new Date(), note: "Items left in cart" }],
    })],
    ["admin-feedback", buildFeedbackAdminEmail({ rating: 4, comment: "Checkout was quick. Would love more colour options." })],
  ];
}
