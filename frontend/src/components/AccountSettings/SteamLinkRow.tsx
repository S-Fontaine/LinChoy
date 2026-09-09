"use client";
import {
  rowClass,
  rowLabelClass,
  rowValueContainerClass,
  rowValueClass,
  modifyBtnClass,
} from "./AccountSettings.styles";
import { useAuth } from "@/context/AuthContext";
import { useSteamLink } from "@/hooks/useSteamLink";
import InlineMessage from "./InlineMessage";

export default function SteamLinkRow() {
  const { user } = useAuth();
  const { message, setMessage, unlinkLoading, handleLinkSteam, handleUnlinkSteam } =
    useSteamLink();

  if (!user) return null;

  return (
    <div className={rowClass}>
      <div className={rowLabelClass}>Compte Steam</div>
      <div className={rowValueContainerClass}>
        <span className={rowValueClass}>
          {user.steamId ? user.steamId : "Non lié"}
        </span>
        {user.steamId ? (
          <button
            className={modifyBtnClass}
            onClick={handleUnlinkSteam}
            disabled={unlinkLoading}
          >
            {unlinkLoading ? "..." : "Délier"}
          </button>
        ) : (
          <button className={modifyBtnClass} onClick={handleLinkSteam}>
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
