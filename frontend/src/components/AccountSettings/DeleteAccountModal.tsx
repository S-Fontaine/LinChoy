"use client";
import { useState } from "react";
import { contentTitleClass, errorTextClass } from "./AccountSettings.styles";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Modal from "../ui/Modal";
import { eyeOff, eyeOn } from "../icons/Icons";

const inputGroupClass = "flex flex-col gap-2";
const labelClass = "text-[0.85rem] font-medium text-text-high";
const inputClass =
  "w-full rounded-lg border border-border bg-bg-input px-4 py-3 pr-11.25 text-[0.95rem] text-text-high outline-none transition-all duration-300 ease-smooth focus:border-lin-orange focus:shadow-[0_0_0_2px_var(--lin-orange-glow)]";
const eyeButtonClass =
  "absolute top-1/2 right-5 z-[2] flex -translate-y-1/2 items-center rounded-full border-0 bg-transparent p-0 text-text-medium cursor-pointer";
const dangerTextClass = "text-[0.9rem] text-text-medium";
const dangerBtnClass =
  "cursor-pointer rounded-lg border-0 bg-[#e04b4b] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteState, setDeleteState] = useState({ loading: false, error: "" });

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setDeleteState({ loading: true, error: "" });

    try {
      const res = await fetchWithAuth(`/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!res.ok) {
        const result = await res.json();
        setDeleteState({
          loading: false,
          error: result.message || "Une erreur est survenue",
        });
        return;
      }

      await logout();
    } catch {
      setDeleteState({ loading: false, error: "Erreur réseau, réessayez." });
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setDeletePassword("");
        setDeleteState({ loading: false, error: "" });
        onClose();
      }}
    >
      <form onSubmit={handleDelete} className="flex flex-col gap-5">
        <h2 className={contentTitleClass}>Confirmer la suppression</h2>
        <p className={dangerTextClass}>
          Entre ton mot de passe pour confirmer. Cette action est définitive.
        </p>
        <div className={inputGroupClass}>
          <label className={labelClass} htmlFor="account-delete-password">
            Mot de passe
          </label>
          <input
            type="email"
            autoComplete="username"
            value={user?.email ?? ""}
            readOnly
            tabIndex={-1}
            className="sr-only"
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="current-password"
              autoComplete="current-password"
              id="account-delete-password"
              className={inputClass}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={eyeButtonClass}
              aria-label="Afficher ou masquer le mot de passe"
            >
              {showPassword ? eyeOff : eyeOn}
            </button>
          </div>
        </div>
        {deleteState.error && (
          <p className={errorTextClass}>{deleteState.error}</p>
        )}
        <button
          type="submit"
          className={dangerBtnClass}
          disabled={deleteState.loading || deletePassword.length === 0}
        >
          {deleteState.loading ? "Suppression..." : "Confirmer la suppression"}
        </button>
      </form>
    </Modal>
  );
}
