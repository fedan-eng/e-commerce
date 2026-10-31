// hooks/useCompleteSignIn.js — after the session cookie is set (password, code or link),
// keep what's in the visitor's cart and load the account into Redux.
import { useCallback } from "react";
import { useDispatch, useStore } from "react-redux";
import { fetchUser } from "@/store/features/authSlice";

export function useCompleteSignIn() {
  const dispatch = useDispatch();
  const store = useStore();

  return useCallback(async () => {
    const visitorCart = store.getState().cart.items;
    if (visitorCart.length > 0) {
      await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorCart }),
      }).catch((err) => console.error("Cart merge failed:", err));
    }
    return dispatch(fetchUser()).unwrap().catch(() => null);
  }, [dispatch, store]);
}
