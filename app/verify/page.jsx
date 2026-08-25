import React, { Suspense } from "react";
import VerificationForm from "@/components/VerificationForm";
import Loading from "@/components/Loading";

const VerifyPage = () => {
  return (
    <div className = "">
      <Suspense fallback={<Loading />}>
        <VerificationForm />
      </Suspense>
    </div>
  );
};

export default VerifyPage;
