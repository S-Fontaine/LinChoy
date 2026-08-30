"use client";
import styles from "./Sign.module.css";
import { eyeOff, eyeOn } from "../icons/Icons";
import { useState } from "react";

interface IFormData {
  email: string;
  password: string;
}
interface IApiResponse {
  loading: boolean;
  error: string;
  success: string;
}

interface ISignIn {
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: IFormData;
  apiResponse: IApiResponse;
  onForgotPassword: () => void;
}

export default function SignIn({
  handleSubmit,
  handleInputChange,
  formData,
  apiResponse,
  onForgotPassword,
}: ISignIn) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form onSubmit={handleSubmit} className={styles.form} key="form-login">
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label className={styles.label}>Mot de passe</label>
          <button
            type="button"
            onClick={onForgotPassword}
            className={styles.forgotLink}
          >
            Mot de passe oublié ?
          </button>
        </div>
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
        className={styles.btn}
      >
        {apiResponse.loading ? "Patientez..." : "Se connecter"}
      </button>
    </form>
  );
}
