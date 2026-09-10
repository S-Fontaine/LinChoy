"use client";
import { useState } from "react";
import { restartIcon, boltIcon, powerIcon } from "@/components/icons/Icons";
import {
  listRowBaseClass,
  listRowActiveClass,
  listRowInactiveClass,
  rowActionsClass,
  rowActionBtnClass,
} from "./Admin.styles";
import type { AdminGameServer, PowerAction } from "./types";

export default function GameServerListRow({
  server,
  isSelected,
  onClick,
  onPower,
}: {
  server: AdminGameServer;
  isSelected: boolean;
  onClick: () => void;
  onPower: (
    id: string,
    action: PowerAction,
  ) => Promise<{ success: boolean; message: string }>;
}) {
  const [pending, setPending] = useState<PowerAction | null>(null);

  async function trigger(action: PowerAction, confirmText?: string) {
    if (pending) return;
    if (confirmText && !confirm(confirmText)) return;
    setPending(action);
    await onPower(server._id, action);
    setPending(null);
  }

  return (
    <div
      className={`${listRowBaseClass} ${isSelected ? listRowActiveClass : listRowInactiveClass}`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent p-0 text-left text-inherit"
      >
        {server.serverInfo.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={server.serverInfo.image}
            alt=""
            className="h-6 w-6 shrink-0 rounded object-cover"
          />
        )}
        <span className="truncate">{server.name}</span>
      </button>

      <div className={rowActionsClass}>
        <button
          type="button"
          title="Redémarrer"
          aria-label={`Redémarrer ${server.name}`}
          className={rowActionBtnClass}
          disabled={pending !== null}
          onClick={() => trigger("restart")}
        >
          {restartIcon}
        </button>
        <button
          type="button"
          title="Redémarrage d'urgence"
          aria-label={`Redémarrage d'urgence de ${server.name}`}
          className={`${rowActionBtnClass} hover:text-lin-orange`}
          disabled={pending !== null}
          onClick={() =>
            trigger(
              "emergency-restart",
              `Redémarrage d'urgence de "${server.name}" — les joueurs seront prévenus pendant 30 secondes avant le redémarrage forcé. Continuer ?`,
            )
          }
        >
          {boltIcon}
        </button>
        <button
          type="button"
          title="Éteindre"
          aria-label={`Éteindre ${server.name}`}
          className={`${rowActionBtnClass} hover:text-[#e04b4b]`}
          disabled={pending !== null}
          onClick={() =>
            trigger(
              "shutdown",
              `Éteindre "${server.name}" ? Les joueurs seront prévenus pendant 5 minutes avant l'extinction, qui restera effective jusqu'à un redémarrage manuel.`,
            )
          }
        >
          {powerIcon}
        </button>
      </div>
    </div>
  );
}
