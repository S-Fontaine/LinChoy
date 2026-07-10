"use client";

import { useState } from "react";
import styles from "../styles/AuthCard.module.css";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const eyeOff = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
  >
    <path
      fill="var(--text-medium)"
      d="M8.137 15.147c-.71-.857-1.146-1.947-1.146-3.147 0-2.76 2.241-5 5-5 1.201 0 2.291.435 3.148 1.145l1.897-1.897c-1.441-.738-3.122-1.248-5.035-1.248-6.115 0-10.025 5.355-10.842 6.584.529.834 2.379 3.527 5.113 5.428l1.865-1.865zm6.294-6.294c-.673-.53-1.515-.853-2.44-.853-2.207 0-4 1.792-4 4 0 .923.324 1.765.854 2.439l5.586-5.586zm7.56-6.146l-19.292 19.293-.708-.707 3.548-3.548c-2.298-1.612-4.234-3.885-5.548-6.169 2.418-4.103 6.943-7.576 12.01-7.576 2.065 0 4.021.566 5.782 1.501l3.501-3.501.707.707zm-2.465 3.879l-.734.734c2.236 1.619 3.628 3.604 4.061 4.274-.739 1.303-4.546 7.406-10.852 7.406-1.425 0-2.749-.368-3.951-.938l-.748.748c1.475.742 3.057 1.19 4.699 1.19 5.274 0 9.758-4.006 11.999-8.436-1.087-1.891-2.63-3.637-4.474-4.978zm-3.535 5.414c0-.554-.113-1.082-.317-1.562l.734-.734c.361.69.583 1.464.583 2.296 0 2.759-2.24 5-5 5-.832 0-1.604-.223-2.295-.583l.734-.735c.48.204 1.007.318 1.561.318 2.208 0 4-1.792 4-4z"
    />
  </svg>
);

const eyeOn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
  >
    <path
      fill="var(--text-medium)"
      d="M12.01 20c-5.065 0-9.586-4.211-12.01-8.424 2.418-4.103 6.943-7.576 12.01-7.576 5.135 0 9.635 3.453 11.999 7.564-2.241 4.43-6.726 8.436-11.999 8.436zm-10.842-8.416c.843 1.331 5.018 7.416 10.842 7.416 6.305 0 10.112-6.103 10.851-7.405-.772-1.198-4.606-6.595-10.851-6.595-6.116 0-10.025 5.355-10.842 6.584zm10.832-4.584c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 1c2.208 0 4 1.792 4 4s-1.792 4-4 4-4-1.792-4-4 1.792-4 4-4z"
    />
  </svg>
);

interface IAuthCard {
  isLogin: boolean;
  onSwitchClick: () => void;
  onResult: () => void;
}

export default function AuthCard({
  isLogin,
  onSwitchClick,
  onResult,
}: IAuthCard) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [apiResponse, setApiResponse] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLogin && formData.password !== confirmPassword) {
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
      : formData;

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
          onResult();
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isLogin ? "Bon retour !" : "Rejoindre le club"}
          </h2>
          <p className={styles.subtitle}>
            {isLogin
              ? "Accède à tes serveurs et au chat."
              : "Crée un compte pour demander ton accès."}
          </p>
        </div>

        {apiResponse.error && (
          <div className={styles.errorBox}>{apiResponse.error}</div>
        )}
        {apiResponse.success && (
          <div className={styles.successBox}>{apiResponse.success}</div>
        )}

        {isLogin ? (
          /* --- FORMULAIRE DE CONNEXION --- */
          <form
            onSubmit={handleSubmit}
            className={styles.form}
            key="form-register"
          >
            <div className={styles.inputGroup}>
              <label className={styles.label}>Adresse Email</label>
              <input
                type="text"
                inputMode="email"
                name="email"
                id="login-username"
                required
                placeholder="JosephLeGourmand@exemple.com"
                autoComplete="username"
                className={styles.input}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Mot de passe</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="login-password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? eyeOff : eyeOn}{" "}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={apiResponse.loading}
              className={styles.btnPrimary}
            >
              {apiResponse.loading ? "Patientez..." : "Se connecter"}
            </button>
          </form>
        ) : (
          /* --- FORMULAIRE D'INSCRIPTION --- */
          <form
            onSubmit={handleSubmit}
            className={styles.form}
            key="form-login"
          >
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nom d&apos;utilisateur</label>
              <input
                type="text"
                name="username"
                required
                placeholder="JosephLeGourmand"
                autoComplete="username"
                className={styles.input}
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Adresse Email</label>
              <input
                type="text"
                inputMode="email"
                name="email"
                required
                placeholder="josephlegourmand@exemple.com"
                autoComplete="email"
                className={styles.input}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Mot de passe</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={styles.input}
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? eyeOff : eyeOn}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirmer le mot de passe</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  style={{
                    width: "100%",
                    paddingRight: "45px",
                    borderColor:
                      confirmPassword.length > 0 &&
                      confirmPassword !== formData.password
                        ? "var(--lin-orange)"
                        : "var(--border)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.eyeButton}
                  aria-label="Confirmer le mot de passe"
                >
                  {showConfirmPassword ? eyeOff : eyeOn}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={apiResponse.loading}
              className={styles.btnPrimary}
            >
              {apiResponse.loading ? "Patientez..." : "S'inscrire"}
            </button>
          </form>
        )}

        <div className={styles.footerContainer}>
          <button
            onClick={() => {
              onSwitchClick();
              setApiResponse({ loading: false, error: "", success: "" });
            }}
            className={styles.switchBtn}
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
