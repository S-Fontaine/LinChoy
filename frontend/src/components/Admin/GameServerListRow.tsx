"use client";
import { useState } from "react";
import {
  restartIcon,
  quickRestartIcon,
  boltIcon,
  powerIcon,
  playIcon,
} from "@/components/icons/Icons";
import {
  listRowBaseClass,
  listRowActiveClass,
  listRowInactiveClass,
  rowActionsClass,
  rowActionBtnClass,
  rowStatusRowClass,
  rowStatusDotClass,
  rowStatusLabelClass,
  rowStatusLabelText,
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
  const state = server.statusInfo.state;
  const showStart = state === "offline";
  const showQuickRestart = state === "online";
  const showRestart = state === "online";
  const showShutdown = state === "starting" || state === "online";

  async function trigger(
    e: React.MouseEvent,
    action: PowerAction,
    confirmText?: string,
  ) {
    e.stopPropagation();
    if (pending) return;
    if (confirmText && !confirm(confirmText)) return;
    setPending(action);
    await onPower(server._id, action);
    setPending(null);
  }

  return (
    <div
      onClick={onClick}
      className={`${listRowBaseClass} cursor-pointer ${isSelected ? listRowActiveClass : listRowInactiveClass}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {server.serverInfo.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={server.serverInfo.image}
              alt=""
              className="h-8 w-8 shrink-0 rounded object-cover"
            />
          )}
          <span className="truncate text-[1.05rem] font-semibold">{server.name}</span>
        </div>

        <div className={rowStatusRowClass}>
          <span className={rowStatusLabelClass[state]}>
            {rowStatusLabelText[state]}
          </span>
          <div className={`h-2.5 w-2.5 rounded-full ${rowStatusDotClass[state]}`} />
        </div>
      </div>

      <div className={rowActionsClass}>
        {showStart && (
          <button
            type="button"
            title="Démarrer"
            aria-label={`Démarrer ${server.name}`}
            className={`${rowActionBtnClass} hover:text-choy-green`}
            disabled={pending !== null}
            onClick={(e) => trigger(e, "start")}
          >
            {playIcon}
          </button>
        )}
        {showQuickRestart && (
          <button
            type="button"
            title="Redémarrage rapide"
            aria-label={`Redémarrage rapide de ${server.name}`}
            className={`${rowActionBtnClass} hover:text-choy-green`}
            disabled={pending !== null}
            onClick={(e) =>
              trigger(
                e,
                "quick-restart",
                `Redémarrage rapide de "${server.name}" — les joueurs seront prévenus pendant 30 secondes avant un redémarrage normal. Continuer ?`,
              )
            }
          >
            {quickRestartIcon}
          </button>
        )}
        {showRestart && (
          <button
            type="button"
            title="Redémarrer"
            aria-label={`Redémarrer ${server.name}`}
            className={rowActionBtnClass}
            disabled={pending !== null}
            onClick={(e) => trigger(e, "restart")}
          >
            {restartIcon}
          </button>
        )}
        {showShutdown && (
          <button
            type="button"
            title="Éteindre"
            aria-label={`Éteindre ${server.name}`}
            className={`${rowActionBtnClass} hover:text-danger`}
            disabled={pending !== null}
            onClick={(e) =>
              trigger(
                e,
                "shutdown",
                `Éteindre "${server.name}" ? Les joueurs seront prévenus pendant 5 minutes avant l'extinction, qui restera effective jusqu'à un redémarrage manuel.`,
              )
            }
          >
            {powerIcon}
          </button>
        )}
        <button
          type="button"
          title="Redémarrage d'urgence"
          aria-label={`Redémarrage d'urgence de ${server.name}`}
          className={`${rowActionBtnClass} ml-auto border-lin-orange text-lin-orange`}
          disabled={pending !== null}
          onClick={(e) =>
            trigger(
              e,
              "emergency-restart",
              `Redémarrage d'urgence de "${server.name}" — les joueurs seront prévenus pendant 30 secondes avant le redémarrage forcé. Continuer ?`,
            )
          }
        >
          {boltIcon}
        </button>
      </div>
    </div>
  );
}
