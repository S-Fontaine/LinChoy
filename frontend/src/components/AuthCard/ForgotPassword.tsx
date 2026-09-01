"use client";
import styles from "./Sign.module.css";

interface IForgotPassword {
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
}

export default function ForgotPassword({
  email,
  onEmailChange,
  onSubmit,
  loading,
}: IForgotPassword) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="forgot-password-email">
          Adresse Email
        </label>
        <input
          type="email"
          id="forgot-password-email"
          required
          placeholder="JosephLeGourmand@exemple.com"
          className={styles.input}
          value={email}
          onChange={onEmailChange}
        />
      </div>
      <button type="submit" disabled={loading} className={styles.btn}>
        {loading ? "Envoi..." : "Recevoir le lien"}
      </button>
    </form>
  );
}
