// @vitest-environment node
import { describe, expect, it } from "vitest";
import { emailSamples } from "../../scripts/email-samples.mjs";
import { buildOrderStatusEmail } from "./orderEmails";
import { buildContactAdminEmail, buildFeedbackAdminEmail, buildRequestAdminEmail, buildRequestStatusEmail } from "./supportEmails";
import { imageUrl, progress } from "./layout";

const order = {
  _id: "6719f0c2a8b4e3d2c1f0a9b8",
  firstName: "Ada",
  email: "ada@example.com",
  items: [{ name: "Power Bank", quantity: 2, price: 15000 }],
  subTotal: 30000,
  deliveryFee: 2500,
  total: 32500,
};

describe("every email", () => {
  it.each(emailSamples())("%s has a subject, plain text and the shared dark-mode-safe layout", (name, email) => {
    expect(email.subject).toBeTruthy();
    expect(email.text.length).toBeGreaterThan(40);
    expect(email.html).toContain('<meta name="color-scheme" content="light dark">');
    expect(email.html).toContain("fil-logo-pine.png");
    expect(email.html).not.toMatch(/undefined|NaN|\[object Object\]/);
  });
});

describe("order emails", () => {
  it("uses the short order number customers see on the site", () => {
    const { subject, html } = buildOrderStatusEmail(order, "shipped");
    expect(subject).toContain("#C1F0A9B8");
    expect(html).toContain("Order #C1F0A9B8");
  });

  it("skips delivery rows a quick-checkout order doesn't have", () => {
    const { html } = buildOrderStatusEmail(order, "confirmed");
    expect(html).not.toContain(">Address<");
    expect(html).not.toContain(">Phone<");
  });

  it("shows each item's photo, making site-relative paths absolute", () => {
    const withPhotos = {
      ...order,
      items: [
        { name: "Power Bank", quantity: 1, price: 15000, image: "/powerbank.png" },
        { name: "Earbuds", quantity: 1, price: 9000, image: "https://res.cloudinary.com/fil/earbuds.webp" },
      ],
    };
    const { html } = buildOrderStatusEmail(withPhotos, "shipped");
    expect(html).toContain('src="https://www.filstore.com.ng/powerbank.png"');
    expect(html).toContain('src="https://res.cloudinary.com/fil/earbuds.webp"');
  });

  it("returns null for statuses without an email", () => {
    expect(buildOrderStatusEmail(order, "cancelled")).toBeNull();
  });

  it("uses the given review link on the delivered email", () => {
    const { html, text } = buildOrderStatusEmail(order, "delivered", { ctaLink: "https://x.test/review?token=abc" });
    expect(html).toContain('href="https://x.test/review?token=abc"');
    expect(text).toContain("https://x.test/review?token=abc");
  });

  it("fills the progress bar up to the current step", () => {
    const filled = (status) => (progress(status).match(/class="fx-done"/g) || []).length;
    expect(filled("confirmed")).toBe(1);
    expect(filled("shipped")).toBe(3);
    expect(filled("intransit")).toBe(4);
    expect(filled("delivered")).toBe(5);
  });
});

describe("support emails", () => {
  it("escapes what customers type", () => {
    const { html } = buildContactAdminEmail({
      inquiryType: "general",
      name: '<img src=x onerror="alert(1)">',
      email: "a@b.co",
      question: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
  });

  it("shows the product photo on refund and return requests", () => {
    const { html } = buildRequestAdminEmail({
      _id: "671a0b3c9d8e7f6a5b4c3d2e", code: "RT-M4XP2D", type: "return", orderId: order._id, quantity: 1, reason: "Faulty",
      item: { name: "Power Bank", image: "/powerbank.png", price: 15000 }, bank: {},
    });
    expect(html).toContain('src="https://www.filstore.com.ng/powerbank.png"');
  });

  it("masks the account number in customer refund emails", () => {
    const { html, text } = buildRequestStatusEmail({
      code: "RF-7K3F9Q", type: "refund", status: "approved", orderId: order._id, quantity: 1, reason: "Faulty", firstName: "Ada",
      item: { name: "Power Bank", price: 15000 }, bank: { bankName: "GTBank", accountNumber: "0123456789", accountName: "Ada" },
    }, "https://www.filstore.com.ng/track?code=RF-7K3F9Q&key=k");
    expect(html).toContain("GTBank ••••6789");
    expect(html + text).not.toContain("0123456789");
  });

  it("drops image sources that aren't web links", () => {
    expect(imageUrl("javascript:alert(1)")).toBe("");
    expect(imageUrl("//cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  });

  it("rounds odd feedback ratings to whole stars", () => {
    expect(buildFeedbackAdminEmail({ rating: 4.4, comment: "" }).subject).toBe("New feedback: 4/5 ★★★★☆");
  });
});
