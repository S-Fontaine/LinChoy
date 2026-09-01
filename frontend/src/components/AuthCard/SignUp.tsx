"use client";
import styles from "./Sign.module.css";
import { eyeOff, eyeOn } from "../icons/Icons";
import { useState } from "react";

interface IFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface IApiResponse {
  loading: boolean;
  error: string;
  success: string;
}

interface ISignUp {
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: IFormData;
  apiResponse: IApiResponse;
}

const PASSWORD_RULES = [
  { label: "Au moins 12 caractères", test: (pwd: string) => pwd.length >= 12 },
  { label: "Une majuscule", test: (pwd: string) => /[A-Z]/.test(pwd) },
  {
    label: "Un caractère spécial",
    test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
  },
];

export default function SignUp({
  handleSubmit,
  handleInputChange,
  formData,
  apiResponse,
}: ISignUp) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validCount = PASSWORD_RULES.filter((rule) =>
    rule.test(formData.password),
  ).length;
  const isPasswordValid = validCount === PASSWORD_RULES.length;
  const strengthPercent = (validCount / PASSWORD_RULES.length) * 100;
  const strengthColor =
    validCount === 0
      ? "var(--border)"
      : isPasswordValid
        ? "var(--choy-green)"
        : validCount === 2
          ? "var(--lin-orange)"
          : "#e04b4b";

  const passwordsMatch =
    formData.confirmPassword.length === 0 ||
    formData.confirmPassword === formData.password;

  return (
    <form onSubmit={handleSubmit} className={styles.form} key="form-register">
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="signup-nickname">
          Nom d&apos;utilisateur
        </label>
        <input
          type="search"
          name="username"
          id="signup-nickname"
          required
          placeholder="JosephLeGourmand"
          autoComplete="off"
          className={styles.input}
          value={formData.username}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="signup-email">
          Adresse Email
        </label>
        <input
          type="email"
          name="email"
          id="signup-email"
          required
          placeholder="josephlegourmand@exemple.com"
          autoComplete="username"
          className={styles.input}
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="signup-password">
          Mot de passe
        </label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="signup-password"
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

        <div
          className={`${styles.passwordFeedback} ${
            formData.password.length > 0 ? styles.visible : ""
          }`}
        >
          <div className={styles.passwordFeedbackInner}>
            <div className={styles.strengthBar}>
              <div
                className={styles.strengthBarFill}
                style={{
                  width: `${strengthPercent}%`,
                  backgroundColor: strengthColor,
                }}
              />
            </div>
            <ul className={styles.passwordRules}>
              {PASSWORD_RULES.map((rule) => {
                const isValid = rule.test(formData.password);
                return (
                  <li
                    key={rule.label}
                    className={`${styles.ruleItem} ${isValid ? styles.valid : ""}`}
                  >
                    <span className={styles.ruleIcon}>
                      {isValid ? "✓" : "•"}
                    </span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="signup-confirm-password">
          Confirmer le mot de passe
        </label>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            id="signup-confirm-password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={styles.input}
            style={{
              width: "100%",
              paddingRight: "45px",
              borderColor: !passwordsMatch
                ? "var(--lin-orange)"
                : "var(--border)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={styles.eyeButton}
            aria-label="Afficher ou masquer le mot de passe de confirmation"
          >
            {showConfirmPassword ? eyeOff : eyeOn}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={apiResponse.loading || !isPasswordValid || !passwordsMatch}
        className={styles.btn}
      >
        {apiResponse.loading ? "Patientez..." : "S'inscrire"}
      </button>
    </form>
  );
}
