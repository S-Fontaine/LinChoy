import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { isServerOnline } from "../utils/docker.js";
import User from "../models/User.js";
import GameServer from "../models/GameServer.js";

const router = Router();
const PALWORLD_ADDRESS = `${process.env.PALWORLD_API_ADDRESS}`;
const PALWORLD_PORT = Number(process.env.PALWORLD_API_PORT);

router.get("/", async (req, res) => {
  try {
    const data = await GameServer.distinct("name");
    if (!data) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }
    return res.status(200).json({
      result: true,
      gamesList: data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

router.get("/palworld", requireAuth, async (req: AuthRequest, res) => {
  try {
    const online = await isServerOnline(PALWORLD_ADDRESS, PALWORLD_PORT);
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }
    const data = await GameServer.findOne({ name: "Palworld" });
    if (!data) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }
    const palwordData = {
      name: data?.name,
      servername: data?.palworldData?.info.servername,
      description: data?.palworldData?.info.description,
      totalPlayer: data?.palworldData?.metrics.maxplayernum,
      playerOnLine: data?.palworldData?.metrics.currentplayernum,
    };
    if (!online) {
      return res.status(530).json({
        result: false,
        data: palwordData,
      });
    }

    return res.status(200).json({
      result: true,
      data: palwordData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

export default router;
