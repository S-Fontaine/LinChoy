import GameServer from "../../models/GameServer.js";
import ServerWhitelist from "../../models/ServerWhitelist.js";
import { getContainerState } from "./docker.js";
import type { Types } from "mongoose";

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

const PALWORLD_API = `http://${process.env.PALWORLD_API_ADDRESS}:${process.env.PALWORLD_API_PORT}/v1/api`;
const PALWORLD_ADMIN = process.env.PALWORLD_ADMIN;
const FETCH_TIMEOUT_MS = 5000;

const authHeader =
  "Basic " + Buffer.from(`${PALWORLD_ADMIN}`).toString("base64");
const KICK_DELAY_MS = 500;

function extractSteamId(userId: string): string | null {
  const match = /^steam_(\d+)$/.exec(userId);
  return match?.[1] ?? null;
}

async function kickPlayer(userId: string): Promise<void> {
  try {
    const res = await fetch(`${PALWORLD_API}/kick`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
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
  gameServerId: Types.ObjectId,
  players: IPalworldPlayer[],
): Promise<void> {
  if (players.length === 0) return;

  const entries = await ServerWhitelist.find({
    gameServer: gameServerId,
  }).populate<{ user: { steamId: string | null } }>("user", "steamId");
  const whitelistedSteamIds = new Set(
    entries
      .map((entry) => entry.user?.steamId)
      .filter((id): id is string => Boolean(id)),
  );

  for (const player of players) {
    const steamId = extractSteamId(player.userId);
    if (!steamId || !whitelistedSteamIds.has(steamId)) {
      await kickPlayer(player.userId);
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
    const [infoRes, playersRes] = await Promise.all([
      fetch(`${PALWORLD_API}/info`, {
        headers: { Authorization: authHeader },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }),
      fetch(`${PALWORLD_API}/players`, {
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
      await kickNonWhitelistedPlayers(existing._id, players);
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
