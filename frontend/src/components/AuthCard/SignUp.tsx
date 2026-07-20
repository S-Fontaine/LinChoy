"use client";
import styles from "@/styles/Sign.module.css";
import { eyeOff, eyeOn } from "../AuthCard";
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

export default function SignUp({
  handleSubmit,
  handleInputChange,
  formData,
  apiResponse,
}: ISignUp) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit} className={styles.form} key="form-login">
      <div className={styles.inputGroup}>
        <label className={styles.label}>Nom d&apos;utilisateur</label>
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
        <label className={styles.label}>Adresse Email</label>
        <input
          type="email"
          name="email"
          id="username"
          required
          placeholder="josephlegourmand@exemple.com"
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
            name="confirmPassword"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={styles.input}
            style={{
              width: "100%",
              paddingRight: "45px",
              borderColor:
                formData.confirmPassword.length > 0 &&
                formData.confirmPassword !== formData.password
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
        className={styles.btn}
      >
        {apiResponse.loading ? "Patientez..." : "S'inscrire"}
      </button>
    </form>
  );
}
