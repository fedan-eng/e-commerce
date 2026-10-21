// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mailer", () => ({ sendEmail: vi.fn() }));
process.env.JWT_SECRET = "test-secret";

const { checkVerificationCode, generatePassword, issueVerification, MAX_CODE_ATTEMPTS } = await import("./verification");

const newUser = () => ({ email: "ada@example.com", verificationCodeAttempts: 0 });

describe("generatePassword", () => {
  it("makes 10 characters with upper, lower, digit and symbol", () => {
    for (let i = 0; i < 50; i++) {
      const pw = generatePassword();
      expect(pw).toHaveLength(10);
      expect(pw).toMatch(/[A-Z]/);
      expect(pw).toMatch(/[a-z]/);
      expect(pw).toMatch(/\d/);
      expect(pw).toMatch(/[@$!%*?&#]/);
    }
  });
});

describe("verification codes", () => {
  it("issues a 6-digit code and a link, storing only a hash", () => {
    const user = newUser();
    const { code, link } = issueVerification(user, "https://filstore.com.ng");
    expect(code).toMatch(/^\d{6}$/);
    expect(user.verificationCode).not.toContain(code);
    expect(link).toBe(`https://filstore.com.ng/verify-email?token=${user.verificationToken}`);
  });

  it("accepts the right code", () => {
    const user = newUser();
    const { code } = issueVerification(user, "https://x.test");
    expect(checkVerificationCode(user, code)).toBe("");
  });

  it("rejects a wrong code and counts the attempt", () => {
    const user = newUser();
    const { code } = issueVerification(user, "https://x.test");
    const wrong = code === "000000" ? "111111" : "000000";
    expect(checkVerificationCode(user, wrong)).toMatch(/isn't right/);
    expect(user.verificationCodeAttempts).toBe(1);
  });

  it("locks after too many attempts, even with the right code", () => {
    const user = newUser();
    const { code } = issueVerification(user, "https://x.test");
    user.verificationCodeAttempts = MAX_CODE_ATTEMPTS;
    expect(checkVerificationCode(user, code)).toMatch(/Too many attempts/);
  });

  it("rejects an expired code", () => {
    const user = newUser();
    const { code } = issueVerification(user, "https://x.test");
    user.verificationCodeExpiry = new Date(Date.now() - 1000);
    expect(checkVerificationCode(user, code)).toMatch(/expired/);
  });
});
