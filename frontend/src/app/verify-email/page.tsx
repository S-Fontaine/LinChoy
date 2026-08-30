import { Suspense } from "react";
import { VerifyEmail } from "@/components/VerifyEmail/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Chargement de la vérification...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
