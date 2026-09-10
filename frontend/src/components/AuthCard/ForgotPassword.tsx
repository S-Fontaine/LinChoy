"use client";
import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const errorBoxClass =
  "mb-6 rounded-lg border border-lin-orange bg-[color-mix(in_srgb,var(--lin-orange)_10%,transparent)] p-3 text-center text-[0.9rem] text-lin-orange-light";
const successBoxClass =
  "mb-6 rounded-lg border border-choy-green bg-[color-mix(in_srgb,var(--choy-green)_10%,transparent)] p-3 text-center text-[0.9rem] text-choy-green-light";
const inputClass =
  "w-full rounded-lg border border-border bg-bg-input px-4 py-3 text-[0.95rem] text-text-high outline-none transition-all duration-300 ease-smooth focus:border-lin-orange focus:shadow-[0_0_0_2px_var(--lin-orange-glow)]";
const btnClass =
  "cursor-pointer rounded-lg border border-border bg-bg-surface px-7 py-3.5 text-[0.95rem] font-semibold text-text-high transition-all duration-300 ease-smooth";

export default function ForgotPassword() {
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
      {state.error && <div className={errorBoxClass}>{state.error}</div>}
      {state.success && (
        <div className={successBoxClass}>{state.success}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            className="text-[0.85rem] font-medium text-text-high"
            htmlFor="forgot-password-email"
          >
            Adresse Email
          </label>
          <input
            type="email"
            id="forgot-password-email"
            required
            placeholder="JosephLeGourmand@exemple.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" disabled={state.loading} className={btnClass}>
          {state.loading ? "Envoi..." : "Recevoir le lien"}
        </button>
      </form>
    </>
  );
}
