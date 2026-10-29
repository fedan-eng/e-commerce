import { describe, expect, it } from "vitest";
import { isDisposableEmail } from "./disposableEmail";

describe("isDisposableEmail", () => {
  it("catches throwaway inboxes and their subdomains", () => {
    for (const e of ["a@yopmail.com", "A@YOPMAIL.FR", "b@mailinator.com", "c@guerrillamail.com", "d@x.yopmail.com"]) {
      expect(isDisposableEmail(e)).toBe(true);
    }
  });

  it("lets real providers through", () => {
    for (const e of ["a@gmail.com", "b@yahoo.com", "c@outlook.com", "d@icloud.com", "e@filstore.com.ng", "", "nope"]) {
      expect(isDisposableEmail(e)).toBe(false);
    }
  });
});
