import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

let ref = null;
vi.mock("@/lib/referral", () => ({ getReferral: () => ref }));
vi.mock("next/link", () => ({ default: ({ children, ...p }) => <a {...p}>{children}</a> }));
import PromoCodeInput from "./PromoCodeInput";

beforeEach(() => {
  ref = null;
  global.fetch = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ valid: true, discount: 10 }) }));
});

describe("PromoCodeInput", () => {
  it("shows the code the checkout already holds, so going back and forth keeps it", () => {
    render(<PromoCodeInput subTotal={20000} onApply={vi.fn()} applied={{ code: "DAMMY10", amount: 2000 }} />);
    expect(screen.getByText("DAMMY10")).toBeInTheDocument();
    expect(screen.getByText(/you save/)).toHaveTextContent("₦2,000");
  });

  it("offers to remove the code and keep free delivery when we switched it off", async () => {
    const onApply = vi.fn();
    render(
      <PromoCodeInput
        subTotal={20000}
        onApply={onApply}
        applied={{ code: "WELCOME10", amount: 2000 }}
        notice="Free delivery isn't available with promo codes, so we've switched you to Regular delivery (+₦2,500)."
        removeLabel="Remove code and keep free delivery"
      />
    );
    expect(screen.getByText(/switched you to Regular delivery/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove code and keep free delivery" }));
    expect(onApply).toHaveBeenCalledWith({ promoCode: null, amount: 0, removed: true });
  });

  it("applies a creator's link code on its own, but not after the shopper removed it", async () => {
    ref = "DAMMY10";
    const onApply = vi.fn();
    const { unmount } = render(<PromoCodeInput subTotal={20000} onApply={onApply} autoApplyRef={false} />);
    await new Promise((r) => setTimeout(r, 0));
    expect(global.fetch).not.toHaveBeenCalled();
    unmount();

    render(<PromoCodeInput subTotal={20000} onApply={onApply} />);
    await vi.waitFor(() => expect(onApply).toHaveBeenCalledWith({ promoCode: "DAMMY10", amount: 2000 }));
  });
});
