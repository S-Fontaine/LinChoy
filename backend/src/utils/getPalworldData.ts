import Palworld, { type IPalworldPlayer } from "../models/Palworld.js";

const PALWORLD_API = process.env.PALWORLD_API;
const PALWORLD_ADMIN = process.env.PALWORLD_ADMIN;

const authHeader =
  "Basic " + Buffer.from(`${PALWORLD_ADMIN}`).toString("base64");

export async function syncGameServerData() {
  try {
    const [infoRes, playersRes, metricsRes] = await Promise.all([
      fetch(`${PALWORLD_API}/info`, { headers: { Authorization: authHeader } }),
      fetch(`${PALWORLD_API}/players`, {
        headers: { Authorization: authHeader },
      }),
      fetch(`${PALWORLD_API}/metrics`, {
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

    const serverData = {
      palworld: "Palworld",
      info: infoRes.ok ? await infoRes.json() : {},
      players: playersData,
      metrics: metricsRes.ok ? await metricsRes.json() : {},
    };

    const updated = await Palworld.findOneAndUpdate(
      { palworld: "Palworld" },
      serverData,
      { returnDocument: "after", upsert: true },
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
