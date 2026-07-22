import { Router } from "express";
import Palworld, { type IPalworldPlayer } from "../models/Palworld.js";

const router = Router();

const PALWORLD_API = process.env.PALWORLD_API;
const PALWORLD_ADMIN = process.env.PALWORLD_ADMIN;

const authHeader =
  "Basic " + Buffer.from(`${PALWORLD_ADMIN}`).toString("base64");

// router.get("/settings", requireAuth, async (req: AuthRequest, res) => {
//   try {
//     const user = await User.findById(req.user?.userId).select("-password");
//     if (!user) {
//       return res
//         .status(404)
//         .json({ result: false, message: "Utilisateur introuvable" });
//     }
//     const response = await fetch(`${PALWORLD_API}/settings`, {
//       headers: {
//         Authorization: authHeader,
//       },
//     });
//     if (!response.ok) {
//       return res.status(response.status).json({
//         result: false,
//         message: `Erreur API Palworld: ${response.statusText || response.status}`,
//       });
//     }
//     const settingsData = await response.json();
//     return res.status(200).json({
//       result: true,
//       message: settingsData,
//     });
//   } catch (err) {
//     console.error("Erreur serveur Palworld:", err);
//     return res.status(500).json({ result: false, message: "Erreur serveur" });
//   }
// });

router.patch("/", async (req, res) => {
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
    const updatedPalworld = await Palworld.findOneAndUpdate(
      { palworld: "Palworld" },
      serverData,
      { returnDocument: "after", upsert: true },
    );
    return res.status(200).json({
      result: true,
      data: updatedPalworld,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour des données Palworld:", err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

export default router;
