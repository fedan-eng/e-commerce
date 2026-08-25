import React, { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import Loading from "@/components/Loading";

const LoginPage = () => {
  return (
    <div className="">
      <Suspense fallback={<Loading />}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;
