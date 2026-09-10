"use client";
import { useState } from "react";
import {
  detailPanelClass,
  detailHeaderClass,
  detailTitleRowClass,
  detailTitleClass,
  typeBadgeClass,
  dangerBtnClass,
  primaryBtnClass,
  actionsRowClass,
} from "./Admin.styles";
import GameServerForm from "./GameServerForm";
import {
  isFormValid,
  toFormValue,
  type AdminGameServer,
  type GameServerFormValue,
} from "./types";

export default function GameServerDetail({
  server,
  onSave,
  onDelete,
}: {
  server: AdminGameServer;
  onSave: (
    id: string,
    value: GameServerFormValue,
  ) => Promise<{ success: boolean; message: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>;
}) {
  const [value, setValue] = useState<GameServerFormValue>(() => toFormValue(server));
  const [state, setState] = useState({ loading: false, error: "" });

  async function handleSave() {
    setState({ loading: true, error: "" });
    const result = await onSave(server._id, value);
    if (!result.success) {
      setState({ loading: false, error: result.message });
    } else {
      setState({ loading: false, error: "" });
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement "${server.name}" ?`)) return;
    setState({ loading: true, error: "" });
    const result = await onDelete(server._id);
    if (!result.success) {
      setState({ loading: false, error: result.message });
    }
  }

  return (
    <div className={detailPanelClass}>
      <div className={detailHeaderClass}>
        <div className={detailTitleRowClass}>
          {server.serverInfo.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={server.serverInfo.image}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          )}
          <h2 className={detailTitleClass}>{server.name}</h2>
          <span className={typeBadgeClass}>{server.gameData.type}</span>
        </div>
        <button
          className={dangerBtnClass}
          onClick={handleDelete}
          disabled={state.loading}
        >
          Supprimer
        </button>
      </div>

      <GameServerForm value={value} onChange={setValue} />

      {state.error && (
        <p className="mt-3 shrink-0 text-[0.85rem] text-danger">{state.error}</p>
      )}

      <div className={actionsRowClass}>
        <button
          className={primaryBtnClass}
          onClick={handleSave}
          disabled={state.loading || !isFormValid(value)}
        >
          {state.loading ? "..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
