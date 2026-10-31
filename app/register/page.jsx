import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";
import Loading from "@/components/Loading";

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupForm />
    </Suspense>
  );
}
