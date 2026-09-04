import React, { Suspense } from "react";
import TokenResetForm from "@/components/TokenResetForm";
import Loading from "@/components/Loading";

const TokenResetPasswordPage = () => {
  return (
    <div className="">
      <Suspense fallback={<Loading />}>
        <TokenResetForm />
      </Suspense>
    </div>
  );
};

export default TokenResetPasswordPage;