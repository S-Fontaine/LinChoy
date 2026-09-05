"use client";
import { useState } from "react";
import styles from "./AuthCard.module.css";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import SignUpConfirmation from "./SignUpConfirmation";
import { useAuth } from "@/context/AuthContext";
import { useAutoHeight } from "@/hooks/useAutoHeight";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div
          className={styles.heightAnimator}
          style={{
            height: contentHeight !== undefined ? `${contentHeight}px` : "auto",
          }}
        >
          <div
            ref={contentRef}
            key={transitionKey}
            className={styles.animatedContent}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>

            {apiResponse.error && (
              <div className={styles.errorBox}>{apiResponse.error}</div>
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

        <div className={styles.footerContainer}>
          {forgotPasswordMode ? (
            <button
              onClick={() => setForgotPasswordMode(false)}
              className={styles.switchBtn}
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
              className={styles.switchBtn}
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà inscrit ? Se connecter"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
