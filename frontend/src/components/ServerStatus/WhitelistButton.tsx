"use client";
import { useEffect, useState } from "react";
import styles from "./WhitelistButton.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useSteamLink } from "@/hooks/useSteamLink";
import { useMinecraftLink } from "@/hooks/useMinecraftLink";
import InlineMessage from "../AccountSettings/InlineMessage";

interface WhitelistStatus {
  whitelisted: boolean;
  connection: { address: string; port: number } | null;
}

export default function WhitelistButton({
  slug,
  gameType,
}: {
  slug: string;
  gameType: string;
}) {
  const { user } = useAuth();
  const requiresSteam = gameType !== "minecraft";
  const isLinked = requiresSteam ? !!user?.steamId : !!user?.minecraftUsername;

  const [status, setStatus] = useState<WhitelistStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMinecraftForm, setShowMinecraftForm] = useState(false);

  async function whitelistMe() {
    setActionLoading(true);
    try {
      const res = await fetchWithAuth(`/games/${slug}/whitelist`, {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok) {
        setStatus({ whitelisted: true, connection: result.connection });
      }
    } finally {
      setActionLoading(false);
    }
  }

  const steamLink = useSteamLink(whitelistMe);
  const minecraftLink = useMinecraftLink(() => {
    setShowMinecraftForm(false);
    whitelistMe();
  });

  useEffect(() => {
    if (!isLinked) return;
    let cancelled = false;
    fetchWithAuth(`/games/${slug}/whitelist`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled || !result.result) return;
        setStatus({
          whitelisted: result.whitelisted,
          connection: result.connection,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [isLinked, slug]);

  const message = requiresSteam ? steamLink.message : minecraftLink.message;
  const clearMessage = requiresSteam
    ? () => steamLink.setMessage(null)
    : () => minecraftLink.setMessage(null);

  if (isLinked && status?.whitelisted && status.connection) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.connectionBox}>
          <code>
            {status.connection.address}:{status.connection.port}
          </code>
        </div>
      </div>
    );
  }

  if (isLinked) {
    const checkingStatus = status === null;
    return (
      <div className={styles.wrapper}>
        <button
          className={styles.whitelistBtn}
          onClick={whitelistMe}
          disabled={actionLoading || checkingStatus}
        >
          {actionLoading
            ? "Whitelist en cours..."
            : checkingStatus
              ? "Vérification..."
              : "Me whitelister sur ce serveur"}
        </button>
        {message && <InlineMessage message={message} onClose={clearMessage} />}
      </div>
    );
  }

  if (!requiresSteam && showMinecraftForm) {
    return (
      <div className={styles.wrapper}>
        <form
          onSubmit={minecraftLink.handleLinkMinecraft}
          className={styles.linkForm}
        >
          <input
            type="text"
            value={minecraftLink.minecraftInput}
            onChange={(e) => minecraftLink.setMinecraftInput(e.target.value)}
            placeholder="Pseudo ou UUID Minecraft"
            disabled={minecraftLink.minecraftLoading}
            autoFocus
          />
          <button
            type="submit"
            className={styles.whitelistBtn}
            disabled={
              minecraftLink.minecraftLoading ||
              !minecraftLink.minecraftInput.trim()
            }
          >
            {minecraftLink.minecraftLoading ? "..." : "Lier et whitelister"}
          </button>
        </form>
        {message && <InlineMessage message={message} onClose={clearMessage} />}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.whitelistBtn}
        onClick={
          requiresSteam
            ? steamLink.handleLinkSteam
            : () => setShowMinecraftForm(true)
        }
      >
      {requiresSteam ? "Connecte ton compte Steam" : "Ajoute ton pseudo Minecraft"}
      </button>
      {message && <InlineMessage message={message} onClose={clearMessage} />}
    </div>
  );
}
