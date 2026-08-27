import GameServer from "../models/GameServer.js";
import {
  type IPalworldPlayer,
  type IPalworldInfo,
  type IPalworldMetrics,
  type IPalWorldSettings,
} from "../models/subdocuments/palworld.schema.js";

const PALWORLD_API = `http://${process.env.PALWORLD_API_ADDRESS}:${process.env.PALWORLD_API_PORT}/v1/api`;
const PALWORLD_ADMIN = process.env.PALWORLD_ADMIN;

const authHeader =
  "Basic " + Buffer.from(`${PALWORLD_ADMIN}`).toString("base64");

export async function syncGameServerData() {
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
          "status.online": true,
          "status.playerCount": palworldData.metrics?.currentplayernum ?? 0,
          "status.maxPlayers": palworldData.metrics?.maxplayernum,
          "status.displayName": palworldData.info?.servername,
          "status.description": palworldData.info?.description,
          "status.lastChecked": new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    console.log(
      `[${new Date().toLocaleTimeString()}] Données Palworld synchronisées avec succès !`,
    );
    return updated;
  } catch (err) {
    console.error(
      `[${new Date().toLocaleTimeString()}] Erreur synchro Palworld:`,
      err,
    );
  }
}
