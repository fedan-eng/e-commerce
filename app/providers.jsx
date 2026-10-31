"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store/store";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 999, fontSize: 14 } }} />
    </Provider>
  );
}
