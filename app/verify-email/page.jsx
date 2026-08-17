import React, { Suspense } from "react";
import VerifyEmailContent from "@/components/VerifyEmailContent";

const VerifyEmailPage = () => {
  return (
    <div className="">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
};

export default VerifyEmailPage;
