"use client";
import { useState } from "react";
import styles from "./AccountSettings.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import InlineMessage, { type InlineMessageState } from "./InlineMessage";

export default function SteamLinkRow() {
  const { user, setUser, updateUser } = useAuth();
  const [message, setMessage] = useState<InlineMessageState | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  if (!user) return null;

  async function handleUnlinkSteam() {
    setUnlinkLoading(true);
    try {
      const res = await fetchWithAuth(`/steam/link`, { method: "DELETE" });
      if (res.ok) {
        updateUser((prev) => ({ ...prev, steamId: null }));
      }
    } finally {
      setUnlinkLoading(false);
    }
  }

  function handleLinkSteam() {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/steam/link`,
      "steamLink",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      setMessage({
        type: "error",
        text: "Ton navigateur a bloqué la fenêtre. Autorise les popups pour ce site.",
      });
      return;
    }

    let resolved = false;

    function cleanup() {
      window.removeEventListener("message", handleMessage);
      clearInterval(pollClosed);
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== process.env.NEXT_PUBLIC_BACKEND_URL) return;
      if (event.data?.type !== "steam-link") return;

      resolved = true;

      if (event.data.success) {
        updateUser((prev) => ({ ...prev, steamId: event.data.steamId }));
        setMessage({
          type: "success",
          text: "Compte Steam lié avec succès !",
        });
      } else {
        const errorMessages: Record<string, string> = {
          session_expired:
            "Ta session a expiré pendant la vérification, réessaie.",
          already_linked:
            "Ce compte Steam est déjà lié à un autre utilisateur.",
          invalid: "La vérification Steam a échoué, réessaie.",
        };
        setMessage({
          type: "error",
          text: errorMessages[event.data.error] || "Une erreur est survenue.",
        });
      }

      cleanup();
    }

    const pollClosed = setInterval(async () => {
      if (!popup || !popup.closed) return;
      cleanup();
      if (resolved) return;

      const res = await fetchWithAuth(`/auth/me`);
      if (res.ok) {
        const result = await res.json();
        const newSteamId = result.user.steamId;
        setUser(result.user);
        if (newSteamId && newSteamId !== user?.steamId) {
          setMessage({
            type: "success",
            text: "Compte Steam lié avec succès !",
          });
        }
      }
    }, 500);

    window.addEventListener("message", handleMessage);
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>Compte Steam</div>
      <div className={styles.rowValueContainer}>
        <span className={styles.rowValue}>
          {user.steamId ? user.steamId : "Non lié"}
        </span>
        {user.steamId ? (
          <button
            className={styles.modifyBtn}
            onClick={handleUnlinkSteam}
            disabled={unlinkLoading}
          >
            {unlinkLoading ? "..." : "Délier"}
          </button>
        ) : (
          <button className={styles.modifyBtn} onClick={handleLinkSteam}>
            Lier mon compte Steam
          </button>
        )}
      </div>
      {message && (
        <InlineMessage message={message} onClose={() => setMessage(null)} />
      )}
    </div>
  );
}
