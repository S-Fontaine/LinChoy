"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./AuthCard.module.css";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
      <p className={styles.label}>
        Un lien de confirmation a été envoyé à ton adresse. Clique dessus pour
        activer ton compte.
      </p>
      <p className={styles.infoBox}>
        Pense à vérifier ton dossier spams / courriers indésirables.
      </p>
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <p className={styles.subtitle}>
          Pas reçu d&apos;e-mail ?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className={styles.switchBtn}
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
                ? styles.successBox
                : styles.errorBox
            }
          >
            {resendMessage}
          </p>
        )}
      </div>
    </div>
  );
}
