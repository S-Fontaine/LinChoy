"use client";
import { useState } from "react";
import styles from "./AccountSettings.module.css";
import signStyles from "../AuthCard/Sign.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Modal from "../ui/Modal";

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const [deletePassword, setDeletePassword] = useState("");
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
      <form onSubmit={handleDelete} className={signStyles.form}>
        <h2 className={styles.contentTitle}>Confirmer la suppression</h2>
        <p className={styles.dangerText}>
          Entre ton mot de passe pour confirmer. Cette action est définitive.
        </p>
        <div className={signStyles.inputGroup}>
          <label className={signStyles.label} htmlFor="account-delete-password">
            Mot de passe
          </label>
          <input
            type="password"
            id="account-delete-password"
            className={signStyles.input}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            autoFocus
          />
        </div>
        {deleteState.error && (
          <p className={styles.errorText}>{deleteState.error}</p>
        )}
        <button
          type="submit"
          className={styles.dangerBtn}
          disabled={deleteState.loading || deletePassword.length === 0}
        >
          {deleteState.loading ? "Suppression..." : "Confirmer la suppression"}
        </button>
      </form>
    </Modal>
  );
}
