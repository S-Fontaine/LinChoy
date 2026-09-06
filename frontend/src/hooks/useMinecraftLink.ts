"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { InlineMessageState } from "@/components/AccountSettings/InlineMessage";

export function useMinecraftLink(onLinked?: () => void) {
  const { updateUser } = useAuth();
  const [message, setMessage] = useState<InlineMessageState | null>(null);
  const [minecraftInput, setMinecraftInput] = useState("");
  const [minecraftLoading, setMinecraftLoading] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

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
      onLinked?.();
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
      }
    } finally {
      setUnlinkLoading(false);
    }
  }

  return {
    message,
    setMessage,
    minecraftInput,
    setMinecraftInput,
    minecraftLoading,
    unlinkLoading,
    handleLinkMinecraft,
    handleUnlinkMinecraft,
  };
}
