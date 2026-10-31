import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

let params = new URLSearchParams();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }), useSearchParams: () => params }));
vi.mock("next/link", () => ({ default: ({ children, ...p }) => <a {...p}>{children}</a> }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn() } }));
vi.mock("react-redux", () => ({ useSelector: () => [] }));
import ResetPasswordForm, { TokenResetForm } from "./ResetPasswordForm";

const respond = (status, body) => ({ ok: status < 400, status, json: async () => body });

beforeEach(() => {
  params = new URLSearchParams();
  replace.mockReset();
  global.fetch = vi.fn();
});

describe("ResetPasswordForm", () => {
  it("emails a code, then saves the new password and goes back to sign in", async () => {
    params = new URLSearchParams("email=tolu@gmail.com"); // carried over from the login page
    fetch.mockResolvedValueOnce(respond(200, { message: "Reset code sent" }));
    fetch.mockResolvedValueOnce(respond(200, { message: "Password reset successfully" }));
    render(<ResetPasswordForm />);

    await userEvent.click(screen.getByRole("button", { name: /email me a code/i }));
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/6-digit code/i), "12a3456");
    await userEvent.type(screen.getByLabelText(/^new password/i), "short");
    await userEvent.type(screen.getByLabelText(/confirm new password/i), "other");
    await userEvent.click(screen.getByRole("button", { name: /save new password/i }));
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/don't match/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);

    await userEvent.clear(screen.getByLabelText(/^new password/i));
    await userEvent.type(screen.getByLabelText(/^new password/i), "longenough1");
    await userEvent.clear(screen.getByLabelText(/confirm new password/i));
    await userEvent.type(screen.getByLabelText(/confirm new password/i), "longenough1");
    await userEvent.click(screen.getByRole("button", { name: /save new password/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?email=tolu%40gmail.com"));
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ email: "tolu@gmail.com", resetCode: "123456", newPassword: "longenough1" });
  });

  it("says when there's no account for the email", async () => {
    fetch.mockResolvedValueOnce(respond(404, { message: "User not found" }));
    render(<ResetPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email address/i), "nobody@gmail.com");
    await userEvent.click(screen.getByRole("button", { name: /email me a code/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't find an account/i);
  });
});

describe("TokenResetForm", () => {
  it("offers a new link when the email link has expired", async () => {
    params = new URLSearchParams("token=old");
    fetch.mockResolvedValueOnce(respond(400, { message: "Invalid or expired token" }));
    render(<TokenResetForm />);
    expect(await screen.findByText(/this link has expired/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /send me a new link/i })).toHaveAttribute("href", "/reset-password");
  });

  it("saves the new password for a valid link", async () => {
    params = new URLSearchParams("token=good");
    fetch.mockResolvedValueOnce(respond(200, { valid: true, email: "tolu@gmail.com" }));
    fetch.mockResolvedValueOnce(respond(200, { message: "Password reset successfully" }));
    render(<TokenResetForm />);
    expect(await screen.findByText("tolu@gmail.com")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/^new password/i), "longenough1");
    await userEvent.type(screen.getByLabelText(/confirm new password/i), "longenough1");
    await userEvent.click(screen.getByRole("button", { name: /save new password/i }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?email=tolu%40gmail.com"));
  });
});
