"use client";
import { useState } from "react";
import styles from "./AccountSettings.module.css";
import signStyles from "../AuthCard/Sign.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import InlineMessage, { type InlineMessageState } from "./InlineMessage";
import MinecraftLinkCountdown from "./MinecraftLinkCountdown";

export default function MinecraftLinkRow() {
  const { user, updateUser } = useAuth();
  const [minecraftInput, setMinecraftInput] = useState("");
  const [minecraftLoading, setMinecraftLoading] = useState(false);
  const [message, setMessage] = useState<InlineMessageState | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!user) return null;

  async function handleLinkMinecraft(e: React.FormEvent) {
    e.preventDefault();
    if (!minecraftInput.trim()) return;
    setMinecraftLoading(true);
    setMessage(null);
    try {
      const res = await fetchWithAuth(`/minecraft/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: minecraftInput.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: result.message || "Une erreur est survenue",
        });
        return;
      }
      updateUser((prev) => ({
        ...prev,
        minecraftUuid: result.minecraftUuid,
        minecraftUsername: result.minecraftUsername,
        minecraftVerified: result.minecraftVerified,
        minecraftLinkExpiresAt: result.minecraftLinkExpiresAt,
      }));
      setMinecraftInput("");
      setMessage({
        type: "success",
        text: "Compte Minecraft lié avec succès !",
      });
      setShowForm(false);
    } catch {
      setMessage({ type: "error", text: "Erreur réseau, réessaie." });
    } finally {
      setMinecraftLoading(false);
    }
  }

  async function handleUnlinkMinecraft() {
    setUnlinkLoading(true);
    try {
      const res = await fetchWithAuth(`/minecraft/link`, { method: "DELETE" });
      if (res.ok) {
        updateUser((prev) => ({
          ...prev,
          minecraftUuid: null,
          minecraftUsername: null,
          minecraftVerified: false,
          minecraftLinkExpiresAt: null,
        }));
        setShowForm(false);
      }
    } finally {
      setUnlinkLoading(false);
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>Compte Minecraft</div>
      <div className={styles.rowValueContainer}>
        {user.minecraftUsername &&
          !user.minecraftVerified &&
          user.minecraftLinkExpiresAt && (
            <MinecraftLinkCountdown expiresAt={user.minecraftLinkExpiresAt} />
          )}
        <span className={styles.rowValue}>
          {user.minecraftUsername
            ? user.minecraftVerified
              ? user.minecraftUsername
              : `${user.minecraftUsername} (en attente de connexion)`
            : "Non lié"}
        </span>
        {user.minecraftUsername ? (
          <button
            className={styles.modifyBtn}
            onClick={handleUnlinkMinecraft}
            disabled={unlinkLoading}
          >
            {unlinkLoading ? "..." : "Délier"}
          </button>
        ) : !showForm ? (
          <button
            className={styles.modifyBtn}
            onClick={() => setShowForm(true)}
            aria-expanded={showForm}
          >
            Lier mon compte Minecraft
          </button>
        ) : null}
      </div>

      {!user.minecraftUsername && showForm && (
        <form onSubmit={handleLinkMinecraft} className={signStyles.inputGroup}>
          <label className={signStyles.label} htmlFor="minecraft-link-input">
            Pseudo ou UUID Minecraft
          </label>
          <input
            type="text"
            id="minecraft-link-input"
            className={signStyles.input}
            value={minecraftInput}
            onChange={(e) => setMinecraftInput(e.target.value)}
            placeholder="Notch ou 069a79f4-44e9-4726-a5be-fca90e38aaf5"
            disabled={minecraftLoading}
            autoFocus
          />
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.modifyBtn}
              disabled={minecraftLoading || !minecraftInput.trim()}
            >
              {minecraftLoading ? "..." : "Lier"}
            </button>
            <button
              type="button"
              className={styles.modifyBtn}
              onClick={() => {
                setShowForm(false);
                setMinecraftInput("");
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {message && (
        <InlineMessage message={message} onClose={() => setMessage(null)} />
      )}
    </div>
  );
}
