import GameServer from "../models/GameServer.js";
import {
  type IPalworldPlayer,
  type IPalworldInfo,
  type IPalworldMetrics,
  type IPalWorldSettings,
} from "../models/subdocuments/palworld.schema.js";
import { getContainerState } from "./docker.js";

const PALWORLD_API = `http://${process.env.PALWORLD_API_ADDRESS}:${process.env.PALWORLD_API_PORT}/v1/api`;
const PALWORLD_ADMIN = process.env.PALWORLD_ADMIN;

const authHeader =
  "Basic " + Buffer.from(`${PALWORLD_ADMIN}`).toString("base64");

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
          "status.state": "offline",
          "status.online": false,
          "status.playerCount": 0,
          "status.lastChecked": new Date(),
        },
      },
    );
    return;
  }

  const existing = await GameServer.findOne({ name: "Palworld" });
  if (!existing) {
    console.warn(
      "[sync] Document 'Palworld' introuvable",
    );
    return;
  }

  try {
    const [infoRes, playersRes, metricsRes, settingsRes] = await Promise.all([
      fetch(`${PALWORLD_API}/info`, { headers: { Authorization: authHeader } }),
      fetch(`${PALWORLD_API}/players`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${PALWORLD_API}/metrics`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${PALWORLD_API}/settings`, {
        headers: { Authorization: authHeader },
      }),
    ]);

    const isOnline = infoRes.ok && metricsRes.ok;

    let playersData: IPalworldPlayer[] = [];
    if (playersRes.ok) {
      const json = (await playersRes.json()) as
        | { players?: IPalworldPlayer[] }
        | IPalworldPlayer[];
      playersData = Array.isArray(json) ? json : json.players || [];
    }

    const palworldData = {
      info: infoRes.ok
        ? ((await infoRes.json()) as IPalworldInfo)
        : ({} as IPalworldInfo),
      players: playersData,
      metrics: metricsRes.ok
        ? ((await metricsRes.json()) as IPalworldMetrics)
        : ({} as IPalworldMetrics),
      settings: settingsRes.ok
        ? ((await settingsRes.json()) as IPalWorldSettings)
        : ({} as IPalWorldSettings),
    };

    const updated = await GameServer.findOneAndUpdate(
      { name: "Palworld" },
      {
        $set: {
          palworldData,
          "status.state": isOnline ? "online" : "starting",
          "status.online": isOnline,
          "status.playerCount": isOnline
            ? (palworldData.metrics?.currentplayernum ?? 0)
            : 0,
          "status.maxPlayers": palworldData.metrics?.maxplayernum,
          "status.displayName": palworldData.info?.servername,
          "status.description": palworldData.info?.description,
          "status.lastChecked": new Date(),
          "status.players": palworldData.players.map((player) => player.name),
        },
      },
      { returnDocument: "after" },
    );

    console.log(
      isOnline
        ? `[${new Date().toLocaleTimeString()}] Données Palworld synchronisées avec succès !`
        : `[${new Date().toLocaleTimeString()}] Palworld injoignable (réponse API en erreur)`,
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
          "status.online": false,
          "status.lastChecked": new Date(),
        },
      },
    ).catch((updateErr) => {
      console.error(
        "[Palworld] Échec de la mise à jour du statut :",
        updateErr,
      );
    });
  }
}
