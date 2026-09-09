"use client";
import { memo, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useSteamLink } from "@/hooks/useSteamLink";
import { useMinecraftLink } from "@/hooks/useMinecraftLink";
import InlineMessage from "../AccountSettings/InlineMessage";
import CopyableValue from "../ui/CopyableValue";

const wrapperClass = "mt-3";
const whitelistBtnClass =
  "w-full cursor-pointer rounded-lg border border-border bg-bg-input px-4 py-2.5 text-[0.9rem] text-text-high transition-all duration-300 ease-smooth not-disabled:hover:border-choy-green not-disabled:hover:text-choy-green disabled:cursor-not-allowed disabled:opacity-60";

interface WhitelistStatus {
  whitelisted: boolean;
  connection: { address: string; port: number; password: string | null } | null;
}

function WhitelistButton({
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
      <div className={wrapperClass}>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-choy-green bg-[rgba(50,205,50,0.1)] px-4 py-2.5 text-[0.9rem] text-choy-green-light">
          <CopyableValue
            value={`${status.connection.address}:${status.connection.port}`}
          />
          {status.connection.password && (
            <CopyableValue value={status.connection.password} />
          )}
        </div>
      </div>
    );
  }

  if (isLinked) {
    const checkingStatus = status === null;
    return (
      <div className={wrapperClass}>
        <button
          className={whitelistBtnClass}
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
      <div className={wrapperClass}>
        <form
          onSubmit={minecraftLink.handleLinkMinecraft}
          className="flex flex-wrap gap-2"
        >
          <input
            type="text"
            className="min-w-40 flex-1 rounded-lg border border-border bg-bg-input px-3 py-2.5 text-[0.9rem] text-text-high"
            value={minecraftLink.minecraftInput}
            onChange={(e) => minecraftLink.setMinecraftInput(e.target.value)}
            placeholder="Pseudo ou UUID Minecraft"
            disabled={minecraftLink.minecraftLoading}
            autoFocus
          />
          <button
            type="submit"
            className={whitelistBtnClass}
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
    <div className={wrapperClass}>
      <button
        className={whitelistBtnClass}
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

export default memo(WhitelistButton);
