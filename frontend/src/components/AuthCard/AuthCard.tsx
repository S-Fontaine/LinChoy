"use client";
import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import SignUpConfirmation from "./SignUpConfirmation";
import { useAuth } from "@/context/AuthContext";
import { useAutoHeight } from "@/hooks/useAutoHeight";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const switchBtnClass =
  "cursor-pointer border-0 bg-transparent text-[0.85rem] text-text-medium underline underline-offset-4 transition-all duration-300 ease-smooth hover:text-text-high";

interface IAuthCard {
  onLoginSuccess?: () => void;
  isLogin: boolean;
  onSwitchClick: () => void;
}

export default function AuthCard({
  onLoginSuccess,
  isLogin,
  onSwitchClick,
}: IAuthCard) {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [apiResponse, setApiResponse] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [pendingEmail, setPendingEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const transitionKey = `${isLogin ? "login" : "signup"}-${showConfirmation}-${forgotPasswordMode}`;
  const { contentRef, contentHeight } = useAutoHeight(transitionKey);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setApiResponse({
        loading: false,
        error: "Les mots de passe ne correspondent pas.",
        success: "",
      });
      return;
    }
    setApiResponse({ loading: true, error: "", success: "" });

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.result) {
        setApiResponse({ loading: false, error: data.message, success: "" });
        return;
      }

      setApiResponse({
        loading: false,
        error: "",
        success: isLogin ? "Connexion réussie !" : "Compte créé !",
      });

      if (isLogin) {
        setUser(data.user);
        onLoginSuccess?.();
      } else {
        setPendingEmail(formData.email);
        setShowConfirmation(true);
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch {
      setApiResponse({
        loading: false,
        error: "Impossible de joindre le serveur. Réessaye plus tard.",
        success: "",
      });
    }
  };

  const title = forgotPasswordMode
    ? "Mot de passe oublié"
    : showConfirmation
      ? "Presque prêt !"
      : isLogin
        ? "Bon retour !"
        : "Rejoindre le club";

  const subtitle = forgotPasswordMode
    ? "On t'envoie un lien pour en choisir un nouveau."
    : showConfirmation
      ? "Juste une dernière étape"
      : isLogin
        ? "Accède à tes serveurs et au chat."
        : "Crée un compte pour demander ton accès.";

  return (
    <div className="z-10">
      <div
        className="overflow-hidden transition-[height] duration-500 ease-[ease]"
        style={{
          height: contentHeight !== undefined ? `${contentHeight}px` : "auto",
        }}
      >
        <div
          ref={contentRef}
          key={transitionKey}
          className="animate-[fadeIn_0.5s_ease_backwards] motion-reduce:animate-none"
        >
          <div className="mb-6 border-b border-border pb-6 text-center">
            <h2 className="mb-2 text-[1.75rem] font-bold tracking-[-0.5px] text-text-high">
              {title}
            </h2>
            <p className="text-[0.95rem] text-text-medium">{subtitle}</p>
          </div>

          {apiResponse.error && (
            <div className="mb-6 rounded-lg border border-lin-orange bg-[rgba(255,140,0,0.1)] p-3 text-center text-[0.9rem] text-lin-orange-light">
              {apiResponse.error}
            </div>
          )}

          {forgotPasswordMode ? (
            <ForgotPassword />
          ) : showConfirmation ? (
            <SignUpConfirmation email={pendingEmail} />
          ) : isLogin ? (
            <SignIn
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              formData={formData}
              apiResponse={apiResponse}
              onForgotPassword={() => setForgotPasswordMode(true)}
            />
          ) : (
            <SignUp
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              formData={formData}
              apiResponse={apiResponse}
            />
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6 text-center">
        {forgotPasswordMode ? (
          <button
            onClick={() => setForgotPasswordMode(false)}
            className={switchBtnClass}
          >
            Retour à la connexion
          </button>
        ) : !showConfirmation ? (
          <button
            onClick={() => {
              onSwitchClick();
              setApiResponse({ loading: false, error: "", success: "" });
              setShowConfirmation(false);
            }}
            className={switchBtnClass}
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Déjà inscrit ? Se connecter"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
