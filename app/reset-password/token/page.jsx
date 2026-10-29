// app/reset-password/token/page.jsx — the reset link from the email (?token=)
import { Suspense } from "react";
import { TokenResetForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Choose a new password | FIL", robots: { index: false } };

export default function TokenResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <TokenResetForm />
    </Suspense>
  );
}
