import React, { Suspense } from "react";
import RegistrationForm from "@/components/RegistrationForm";
import Loading from "@/components/Loading";

const RegisterPage = () => {
  return (
    <div className="">
      <Suspense fallback={<Loading />}>
        <RegistrationForm />
      </Suspense>
    </div>
  );
};

export default RegisterPage;

