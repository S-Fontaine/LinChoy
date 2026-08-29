import { Suspense } from "react";
import { ResetPassword } from "@/components/ResetPassword/ResetPassword";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
