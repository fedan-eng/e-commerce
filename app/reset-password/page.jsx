import React, { Suspense } from "react";
import ResetForm from "@/components/ResetForm";
import Loading from "@/components/Loading";

const ResetPasswordPage = () => {
  return (
    <div className = " ">
      <Suspense fallback={<Loading />}>
        <ResetForm/>
      </Suspense>
    </div>
  );
};

export default ResetPasswordPage;
