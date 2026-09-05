"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import styles from "../VerifyEmail/verify-email.module.css";
import PasswordRulesList from "../ui/PasswordRulesList";
import { checkPasswordStrength } from "@/lib/passwordRules";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type View = "checking" | "invalid" | "form" | "success";

export function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [view, setView] = useState<View>(token ? "checking" : "invalid");
  const [message, setMessage] = useState(
    token ? "" : "Lien invalide ou incomplet.",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitState, setSubmitState] = useState({ loading: false, error: "" });
  const { isComplete: isPasswordValid } = checkPasswordStrength(password);

  useEffect(() => {
    if (!token) return;
    async function checkToken() {
      try {
        const res = await fetch(
          `${BACKEND_URL}/auth/reset-password/verify?token=${token}`,
        );
        const data = await res.json();
        if (data.result) {
          setView("form");
        } else {
          setMessage(data.message);
          setView("invalid");
        }
      } catch {
        setMessage("Impossible de joindre le serveur. Réessaie plus tard.");
        setView("invalid");
      }
    }
    checkToken();
  }, [token]);

  const passwordsMatch =
    confirmPassword.length === 0 || confirmPassword === password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitState({ loading: true, error: "" });

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!data.result) {
        setSubmitState({ loading: false, error: data.message });
        return;
      }

      setView("success");
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setSubmitState({
        loading: false,
        error: "Impossible de joindre le serveur.",
      });
    }
  }

  return (
    <Modal isOpen={true} onClose={() => router.push("/")}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {view === "checking" && (
            <div className={styles.header}>
              <h2 className={styles.title}>Vérification...</h2>
              <p className={styles.subtitle}>
                Un instant, on vérifie ton lien.
              </p>
            </div>
          )}

          {view === "invalid" && (
            <>
              <div className={styles.header}>
                <h2 className={styles.title}>Oups !</h2>
                <p className={styles.subtitle}>{message}</p>
              </div>
              <div className={styles.form}>
                <button className={styles.btn} onClick={() => router.push("/")}>
                  Retour à l&apos;accueil
                </button>
              </div>
            </>
          )}

          {view === "success" && (
            <div className={styles.header}>
              <h2 className={styles.title}>C&apos;est fait !</h2>
              <p className={styles.subtitle}>
                Ton mot de passe a été réinitialisé. Redirection en cours...
              </p>
            </div>
          )}

          {view === "form" && (
            <>
              <div className={styles.header}>
                <h2 className={styles.title}>Nouveau mot de passe</h2>
                <p className={styles.subtitle}>
                  Choisis un mot de passe sécurisé.
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="reset-password-new">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="reset-password-new"
                    required
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  <PasswordRulesList password={password} />
                </div>
                <div className={styles.inputGroup}>
                  <label
                    className={styles.label}
                    htmlFor="reset-password-confirm"
                  >
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    id="reset-password-confirm"
                    required
                    className={styles.input}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      borderColor: !passwordsMatch
                        ? "var(--lin-orange)"
                        : "var(--border)",
                    }}
                  />
                </div>

                {submitState.error && (
                  <p className={styles.errorText}>{submitState.error}</p>
                )}

                <button
                  type="submit"
                  className={styles.btn}
                  disabled={
                    submitState.loading || !isPasswordValid || !passwordsMatch
                  }
                >
                  {submitState.loading
                    ? "Patientez..."
                    : "Réinitialiser le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
