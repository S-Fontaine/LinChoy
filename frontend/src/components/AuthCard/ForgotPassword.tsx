"use client";
import { useState } from "react";
import signStyles from "./Sign.module.css";
import cardStyles from "./AuthCard.module.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface IForgotPassword {
  onBack?: () => void;
}

export default function ForgotPassword({ onBack }: IForgotPassword) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ loading: true, error: "", success: "" });
    try {
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setState({ loading: false, error: "", success: data.message });
    } catch {
      setState({
        loading: false,
        error: "Impossible de joindre le serveur.",
        success: "",
      });
    }
  }

  return (
    <>
      {state.error && <div className={cardStyles.errorBox}>{state.error}</div>}
      {state.success && (
        <div className={cardStyles.successBox}>{state.success}</div>
      )}

      <form onSubmit={handleSubmit} className={signStyles.form}>
        <div className={signStyles.inputGroup}>
          <label className={signStyles.label} htmlFor="forgot-password-email">
            Adresse Email
          </label>
          <input
            type="email"
            id="forgot-password-email"
            required
            placeholder="JosephLeGourmand@exemple.com"
            className={signStyles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={state.loading}
          className={signStyles.btn}
        >
          {state.loading ? "Envoi..." : "Recevoir le lien"}
        </button>
      </form>
    </>
  );
}
