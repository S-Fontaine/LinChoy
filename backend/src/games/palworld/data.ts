import GameServer from "../../models/GameServer.js";
import ServerWhitelist from "../../models/ServerWhitelist.js";
import { getContainerState } from "../../utils/gameServers/docker.js";
import { palworldApiUrl, palworldAuthHeader } from "./api.js";
import type { HydratedDocument } from "mongoose";
import type { IGameServer } from "../../models/GameServer.js";

export interface IPalworldPlayer {
  name: string;
  accountName: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
  building_count: number;
}

export interface IPalworldInfo {
  version: string;
  servername: string;
  description: string;
  worldguid: string;
}

const FETCH_TIMEOUT_MS = 5000;
const KICK_DELAY_MS = 500;

function extractSteamId(userId: string): string | null {
  const match = /^steam_(\d+)$/.exec(userId);
  return match?.[1] ?? null;
}

async function kickPlayer(
  server: HydratedDocument<IGameServer>,
  userId: string,
): Promise<void> {
  try {
    const res = await fetch(palworldApiUrl(server, "/kick"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: palworldAuthHeader(server),
      },
      body: JSON.stringify({
        userid: userId,
        message: "Tu n'es pas whitelisté sur ce serveur.",
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    console.log(`[palworld-kick] ${userId} → ${res.status}`);
  } catch (err) {
    console.error(`[palworld-kick] Échec du kick pour ${userId} :`, err);
  }
}

async function kickNonWhitelistedPlayers(
  server: HydratedDocument<IGameServer>,
  players: IPalworldPlayer[],
): Promise<void> {
  if (players.length === 0) return;

  const entries = await ServerWhitelist.find({
    gameServer: server._id,
  }).populate<{ user: { steamId: string | null } }>("user", "steamId");
  const whitelistedSteamIds = new Set(
    entries
      .map((entry) => entry.user?.steamId)
      .filter((id): id is string => Boolean(id)),
  );

  for (const player of players) {
    const steamId = extractSteamId(player.userId);
    if (!steamId || !whitelistedSteamIds.has(steamId)) {
      await kickPlayer(server, player.userId);
      await new Promise((resolve) => setTimeout(resolve, KICK_DELAY_MS));
    }
  }
}

export async function syncGameServerData() {
  let containerRunning = false;
  try {
    const container = await getContainerState("palworld-server");
    containerRunning = container.running;
  } catch {
    containerRunning = false;
  }

  if (!containerRunning) {
    await GameServer.updateOne(
      { name: "Palworld" },
      {
        $set: {
          "statusInfo.state": "offline",
          "statusInfo.online": false,
          "playerInfo.playerCount": 0,
          "statusInfo.lastChecked": new Date(),
        },
      },
    );
    return;
  }

  const existing = await GameServer.findOne({ name: "Palworld" });
  if (!existing) {
    console.warn("[sync] Document 'Palworld' introuvable");
    return;
  }
  try {
    const authHeader = palworldAuthHeader(existing);
    const [infoRes, playersRes] = await Promise.all([
      fetch(palworldApiUrl(existing, "/info"), {
        headers: { Authorization: authHeader },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }),
      fetch(palworldApiUrl(existing, "/players"), {
        headers: { Authorization: authHeader },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }),
    ]);

    const isOnline = infoRes.ok;

    let players: IPalworldPlayer[] = [];
    if (playersRes.ok) {
      const json = (await playersRes.json()) as
        | { players?: IPalworldPlayer[] }
        | IPalworldPlayer[];
      players = Array.isArray(json) ? json : json.players || [];
      await kickNonWhitelistedPlayers(existing, players);
    }

    const info = infoRes.ok
      ? ((await infoRes.json()) as IPalworldInfo)
      : ({} as IPalworldInfo);

    const updated = await GameServer.findOneAndUpdate(
      { name: "Palworld" },
      {
        $set: {
          "statusInfo.state": isOnline ? "online" : "starting",
          "statusInfo.online": isOnline,
          "playerInfo.playerCount": isOnline ? players.length : 0,
          "serverInfo.displayName": info?.servername,
          "serverInfo.version": info?.version,
          "statusInfo.lastChecked": new Date(),
          "playerInfo.players": players.map((player) => ({
            id: player.userId,
            name: player.name,
          })),
        },
      },
      { returnDocument: "after" },
    );

    console.log(
      isOnline
        ? `[${new Date().toLocaleTimeString()}] Données Palworld synchronisées avec succès !`
        : `[${new Date().toLocaleTimeString()}] Palworld injoignable`,
    );
    return updated;
  } catch (err) {
    console.error(
      `[${new Date().toLocaleTimeString()}] Erreur synchro Palworld:`,
      err,
    );
    await GameServer.updateOne(
      { name: "Palworld" },
      {
        $set: {
          "statusInfo.online": false,
          "statusInfo.lastChecked": new Date(),
        },
      },
    ).catch(() => {});
  }
}
