"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import PasswordRulesList from "../ui/PasswordRulesList";
import { checkPasswordStrength } from "@/lib/passwordRules";
import { eyeOff, eyeOn } from "../icons/Icons";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const btnClass =
  "cursor-pointer rounded-lg border border-border bg-bg-surface px-7 py-3.5 text-[0.95rem] font-semibold text-text-high transition-all duration-300 ease-smooth disabled:cursor-not-allowed disabled:opacity-50";
const inputGroupClass = "flex flex-col gap-2 text-left";
const labelClass = "text-[0.85rem] text-text-medium";
const inputBaseClass =
  "w-full rounded-lg border bg-bg-input px-3.5 py-3 pr-11.25 text-[0.95rem] text-text-high";
const eyeButtonClass =
  "absolute top-1/2 right-5 z-[2] flex -translate-y-1/2 items-center rounded-full border-0 bg-transparent p-0 text-text-medium cursor-pointer";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      {view === "checking" && (
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-[1.75rem] font-bold tracking-[-0.5px] text-text-high">
            Vérification...
          </h2>
          <p className="text-[0.95rem] text-text-medium">
            Un instant, on vérifie ton lien.
          </p>
        </div>
      )}

      {view === "invalid" && (
        <>
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-[1.75rem] font-bold tracking-[-0.5px] text-text-high">
              Oups !
            </h2>
            <p className="text-[0.95rem] text-text-medium">{message}</p>
          </div>
          <div className="flex flex-col gap-5">
            <button className={btnClass} onClick={() => router.push("/")}>
              Retour à l&apos;accueil
            </button>
          </div>
        </>
      )}

      {view === "success" && (
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-[1.75rem] font-bold tracking-[-0.5px] text-text-high">
            C&apos;est fait !
          </h2>
          <p className="text-[0.95rem] text-text-medium">
            Ton mot de passe a été réinitialisé. Redirection en cours...
          </p>
        </div>
      )}

      {view === "form" && (
        <>
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-[1.75rem] font-bold tracking-[-0.5px] text-text-high">
              Nouveau mot de passe
            </h2>
            <p className="text-[0.95rem] text-text-medium">
              Choisis un mot de passe sécurisé.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className={inputGroupClass}>
              <label className={labelClass} htmlFor="reset-password-new">
                Nouveau mot de passe
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  id="reset-password-new"
                  required
                  className={`${inputBaseClass} border-border`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={eyeButtonClass}
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? eyeOff : eyeOn}
                </button>
              </div>
              <PasswordRulesList password={password} />
            </div>
            <div className={inputGroupClass}>
              <label className={labelClass} htmlFor="reset-password-confirm">
                Confirmer le mot de passe
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="reset-password-confirm"
                  required
                  className={`${inputBaseClass} ${
                    !passwordsMatch ? "border-lin-orange" : "border-border"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={eyeButtonClass}
                  aria-label="Afficher ou masquer le mot de passe de confirmation"
                >
                  {showConfirmPassword ? eyeOff : eyeOn}
                </button>
              </div>
            </div>

            {submitState.error && (
              <p className="text-[0.85rem] text-[#e04b4b]">
                {submitState.error}
              </p>
            )}

            <button
              type="submit"
              className={btnClass}
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
    </Modal>
  );
}
