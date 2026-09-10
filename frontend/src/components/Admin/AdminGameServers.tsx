"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import InlineMessage, {
  type InlineMessageState,
} from "@/components/AccountSettings/InlineMessage";
import {
  pageWrapperClass,
  shellClass,
  sidebarClass,
  backLinkClass,
  sidebarHeaderClass,
  pageTitleClass,
  adminBadgeClass,
  newRowClass,
  listRowActiveClass,
  newRowInactiveClass,
  primaryBtnClass,
  secondaryBtnClass,
  actionsRowClass,
  detailPanelClass,
  placeholderClass,
} from "./Admin.styles";
import GameServerForm from "./GameServerForm";
import GameServerListRow from "./GameServerListRow";
import GameServerDetail from "./GameServerDetail";
import {
  emptyFormValue,
  isFormValid,
  toApiPayload,
  type AdminGameServer,
  type GameServerFormValue,
  type PowerAction,
} from "./types";

export default function AdminGameServers() {
  const [servers, setServers] = useState<AdminGameServer[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [message, setMessage] = useState<InlineMessageState | null>(null);
  const [createValue, setCreateValue] = useState(emptyFormValue);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetchWithAuth("/admin/game-servers");
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers);
        if (data.servers.length > 0) setSelectedId(data.servers[0]._id);
      } else {
        setServers([]);
        setMessage({ type: "error", text: "Impossible de charger les serveurs." });
      }
    }
    load();
  }, []);

  async function handleSave(id: string, value: GameServerFormValue) {
    const res = await fetchWithAuth(`/admin/game-servers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toApiPayload(value)),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Erreur serveur" };
    }
    setServers((prev) =>
      (prev ?? []).map((s) => (s._id === id ? data.server : s)),
    );
    setMessage({ type: "success", text: "Serveur mis à jour." });
    return { success: true, message: "" };
  }

  async function handleDelete(id: string) {
    const res = await fetchWithAuth(`/admin/game-servers/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, message: data.message || "Erreur serveur" };
    }
    setServers((prev) => (prev ?? []).filter((s) => s._id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
    setMessage({ type: "success", text: "Serveur supprimé." });
    return { success: true, message: "" };
  }

  async function handlePower(id: string, action: PowerAction) {
    const res = await fetchWithAuth(`/admin/game-servers/${id}/${action}`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ type: "error", text: data.message || "Erreur serveur" });
      return { success: false, message: data.message || "Erreur serveur" };
    }
    setMessage({ type: "success", text: data.message || "Action effectuée." });
    return { success: true, message: data.message || "" };
  }

  async function handleCreate() {
    setCreateLoading(true);
    const res = await fetchWithAuth("/admin/game-servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toApiPayload(createValue)),
    });
    const data = await res.json();
    setCreateLoading(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.message || "Erreur serveur" });
      return;
    }
    setServers((prev) => [...(prev ?? []), data.server]);
    setCreateValue(emptyFormValue);
    setSelectedId(data.server._id);
    setMessage({ type: "success", text: "Serveur créé." });
  }

  const selectedServer =
    selectedId && selectedId !== "new"
      ? (servers ?? []).find((s) => s._id === selectedId)
      : undefined;

  return (
    <div className={pageWrapperClass}>
      <div className={shellClass}>
        <aside className={sidebarClass}>
          <Link href="/" className={backLinkClass}>
            ← Retour au site
          </Link>
          <div className={sidebarHeaderClass}>
            <h1 className={pageTitleClass}>Serveurs</h1>
            <span className={adminBadgeClass}>Admin</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateValue(emptyFormValue);
              setSelectedId("new");
            }}
            className={`${newRowClass} ${selectedId === "new" ? listRowActiveClass : newRowInactiveClass}`}
          >
            + Nouveau serveur
          </button>

          {servers === null && (
            <p className="px-3 text-[0.85rem] text-text-low">Chargement…</p>
          )}
          {servers?.map((server) => (
            <GameServerListRow
              key={server._id}
              server={server}
              isSelected={selectedId === server._id}
              onClick={() => setSelectedId(server._id)}
              onPower={handlePower}
            />
          ))}
        </aside>

        {selectedId === "new" ? (
          <div className={detailPanelClass}>
            <GameServerForm value={createValue} onChange={setCreateValue} />
            <div className={actionsRowClass}>
              <button
                className={secondaryBtnClass}
                onClick={() => setSelectedId(servers?.[0]?._id ?? null)}
                disabled={createLoading}
              >
                Annuler
              </button>
              <button
                className={primaryBtnClass}
                onClick={handleCreate}
                disabled={createLoading || !isFormValid(createValue)}
              >
                {createLoading ? "..." : "Créer"}
              </button>
            </div>
          </div>
        ) : selectedServer ? (
          <GameServerDetail
            key={selectedServer._id}
            server={selectedServer}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ) : (
          <p className={placeholderClass}>
            {servers?.length === 0
              ? "Aucun serveur configuré — clique sur « Nouveau serveur »."
              : "Sélectionne un serveur à gauche."}
          </p>
        )}

        {message && (
          <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
            <InlineMessage message={message} onClose={() => setMessage(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
