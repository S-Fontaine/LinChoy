"use client";
import styles from "./Sign.module.css";
import { eyeOff, eyeOn } from "../icons/Icons";
import { useState } from "react";
import { checkPasswordStrength } from "@/lib/passwordRules";
import PasswordRulesList from "../ui/PasswordRulesList";

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

export default function SignUp({
  handleSubmit,
  handleInputChange,
  formData,
  apiResponse,
}: ISignUp) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isComplete: isPasswordValid } = checkPasswordStrength(
    formData.password,
  );

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
          type="text"
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

        {formData.password.length > 0 && (
          <div className={styles.passwordFeedback}>
            <PasswordRulesList
              password={formData.password}
              showStrengthBar={true}
            />
          </div>
        )}
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
