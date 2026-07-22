"use client";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import styles from "./AuthCard.module.css";
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
  const [resendMessage, setResendMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
      } else {
        setApiResponse({
          loading: false,
          error: "",
          success: isLogin
            ? "Connexion réussie !"
            : "Compte créé ! Vérifie tes emails.",
        });
        if (data.result && isLogin) {
          setUser(data.user);
          onLoginSuccess?.();
        }
        if (data.result && !isLogin) {
          setPendingEmail(formData.email);
          setShowConfirmation(true);
          setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
        }
      }
    } catch {
      setApiResponse({
        loading: false,
        error: "Impossible de joindre le serveur. Réessaye plus tard.",
        success: "",
      });
    }
  };
  const AUTH_TEXTS = {
    login: {
      title: "Bon retour !",
      description: "Accède à tes serveurs et au chat.",
      toggleBtn: "Pas encore de compte ? S'inscrire",
      card: (
        <SignIn
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          formData={formData}
          apiResponse={apiResponse}
        />
      ),
    },
    signUp: {
      title: "Rejoindre le club",
      description: "Crée un compte pour demander ton accès.",
      toggleBtn: "Déjà inscrit ? Se connecter",
      card: !showConfirmation ? (
        <SignUp
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          formData={formData}
          apiResponse={apiResponse}
        />
      ) : (
        <div>
          <p className={styles.label}>
            Un lien de confirmation a été envoyé à ton adresse. Clique dessus
            pour activer ton compte.
          </p>
          <p className={styles.infoBox}>
            Pense à vérifier ton dossier spams / courriers indésirables.
          </p>
        </div>
      ),
    },
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await fetch(`${BACKEND_URL}/auth/email/resend-verification`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      setResendMessage("Email renvoyé.");
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setResendMessage("Échec de l'envoi.");
    }
  };

  const currentAuth = isLogin ? AUTH_TEXTS.login : AUTH_TEXTS.signUp;
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {!showConfirmation ? currentAuth.title : "Presque prêt !"}
          </h2>
          <p className={styles.subtitle}>
            {!showConfirmation ? currentAuth.description : "Juste une dernière étape"}
          </p>
        </div>

        {apiResponse.error && (
          <div className={styles.errorBox}>{apiResponse.error}</div>
        )}
        {apiResponse.success && (
          <div className={styles.successBox}>{apiResponse.success}</div>
        )}
        {currentAuth.card}
        <div className={styles.footerContainer}>
          {!showConfirmation ? (
            <button
              onClick={() => {
                onSwitchClick();
                setApiResponse({ loading: false, error: "", success: "" });
                setShowConfirmation(false);
              }}
              className={styles.switchBtn}
            >
              {currentAuth.toggleBtn}
            </button>
          ) : (
            <p className={styles.subtitle}>
              Pas reçu d&apos;e-mail ?
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={styles.switchBtn}
              >
                {resendCooldown > 0
                  ? `Réessaie dans ${resendCooldown}s`
                  : "Clique ici."}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
