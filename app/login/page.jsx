import React, { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

const LoginPage = () => {
  return (
    <div className="">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;
