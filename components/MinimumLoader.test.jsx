import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
import MinimumLoader from "./MinimumLoader";

// Small steps, so React can schedule the next timer (the fade) between them
const advance = async (ms) => {
  for (let t = 0; t < ms; t += 100) await act(() => vi.advanceTimersByTime(Math.min(100, ms - t)));
};

beforeEach(() => {
  vi.useFakeTimers();
  pathname = "/";
  window.history.replaceState(null, "", "/");
});
afterEach(() => vi.useRealTimers());

describe("MinimumLoader", () => {
  it("shows on the first visit for 3 seconds, then fades away", async () => {
    render(<MinimumLoader />);
    expect(screen.getByRole("status")).toHaveTextContent(/think FIL/i);
    await advance(2900);
    expect(screen.getByRole("status")).toBeInTheDocument();
    await advance(500);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the line for the page being opened, from the click, for 3 seconds", async () => {
    const { rerender } = render(<><MinimumLoader /><a href="/products/power-banks">Power banks</a></>);
    await advance(3500);

    act(() => screen.getByText("Power banks").click());
    expect(screen.getByRole("status")).toHaveTextContent(/charging up power banks/i);

    // The page arrives quickly; the loader stays anyway
    pathname = "/products/power-banks";
    rerender(<><MinimumLoader /><a href="/products/power-banks">Power banks</a></>);
    await advance(1000);
    expect(screen.getByRole("status")).toBeInTheDocument();
    await advance(2400);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("ignores links to the same page and new tabs", async () => {
    render(<><MinimumLoader /><a href="/#reviews">Reviews</a><a href="/cart" target="_blank">Cart</a></>);
    await advance(3500);
    act(() => screen.getByText("Reviews").click());
    act(() => screen.getByText("Cart").click());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("covers navigations made in code (router.push) too", async () => {
    const { rerender } = render(<MinimumLoader />);
    await advance(3500);
    pathname = "/profile";
    rerender(<MinimumLoader />);
    expect(screen.getByRole("status")).toHaveTextContent(/your profile/i);
    await advance(3400);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
