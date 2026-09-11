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
  secondaryBtnClass,
  detailActionsRowClass,
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
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave() {
    setState({ loading: true, error: "" });
    const result = await onSave(server._id, value);
    if (!result.success) {
      setState({ loading: false, error: result.message });
    } else {
      setState({ loading: false, error: "" });
      setIsEditing(false);
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

  function handleCancel() {
    setValue(toFormValue(server));
    setState({ loading: false, error: "" });
    setIsEditing(false);
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
        {!isEditing && (
          <button className={secondaryBtnClass} onClick={() => setIsEditing(true)}>
            Modifier
          </button>
        )}
      </div>

      <GameServerForm value={value} onChange={setValue} readOnly={!isEditing} />

      {state.error && (
        <p className="mt-3 shrink-0 text-[0.85rem] text-danger">{state.error}</p>
      )}

      {isEditing && (
        <div className={detailActionsRowClass}>
          <button
            className={dangerBtnClass}
            onClick={handleDelete}
            disabled={state.loading}
          >
            Supprimer
          </button>
          <div className="flex gap-2">
            <button
              className={secondaryBtnClass}
              onClick={handleCancel}
              disabled={state.loading}
            >
              Annuler
            </button>
            <button
              className={primaryBtnClass}
              onClick={handleSave}
              disabled={state.loading || !isFormValid(value)}
            >
              {state.loading ? "..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
