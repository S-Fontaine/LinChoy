import { Suspense } from "react";
import { VerifyEmail } from "@/components/VerifyEmail/VerifyEmail";

export default function VerifyEmailPage({
  onSwitchClick,
}: {
  onSwitchClick?: () => void;
}) {
  return (
    <Suspense fallback={<div>Chargement de la vérification...</div>}>
      <VerifyEmail onSwitchClick={onSwitchClick} />
    </Suspense>
  );
}
