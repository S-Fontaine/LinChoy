"use client";
import { useEffect, useRef, useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const successBoxClass =
  "mb-6 rounded-lg border border-choy-green bg-[color-mix(in_srgb,var(--choy-green)_10%,transparent)] p-3 text-center text-[0.9rem] text-choy-green-light";
const errorBoxClass =
  "mb-6 rounded-lg border border-lin-orange bg-[color-mix(in_srgb,var(--lin-orange)_10%,transparent)] p-3 text-center text-[0.9rem] text-lin-orange-light";

interface ISignUpConfirmation {
  email: string;
}

export default function SignUpConfirmation({ email }: ISignUpConfirmation) {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      await fetch(`${BACKEND_URL}/auth/email/resend-verification`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendMessage("Email renvoyé.");
      setResendCooldown(30);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setResendMessage("Échec de l'envoi.");
    }
  };

  return (
    <div>
      <p className="text-center font-medium text-text-high">
        Un lien de confirmation a été envoyé à ton adresse. Clique dessus pour
        activer ton compte.
      </p>
      <p className="pt-4 text-center text-[0.8rem] leading-[1.6] text-text-low">
        Pense à vérifier ton dossier spams / courriers indésirables.
      </p>
      <div className="mt-6 text-center">
        <p className="text-[0.95rem] text-text-medium">
          Pas reçu d&apos;e-mail ?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="cursor-pointer border-0 bg-transparent text-[0.85rem] text-text-medium underline underline-offset-4 transition-all duration-300 ease-smooth hover:text-text-high"
          >
            {resendCooldown > 0
              ? `Réessaie dans ${resendCooldown}s`
              : "Clique ici."}
          </button>
        </p>
        {resendMessage && (
          <p
            className={
              resendMessage === "Email renvoyé."
                ? successBoxClass
                : errorBoxClass
            }
          >
            {resendMessage}
          </p>
        )}
      </div>
    </div>
  );
}
