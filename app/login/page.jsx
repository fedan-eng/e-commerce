import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import Loading from "@/components/Loading";

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
