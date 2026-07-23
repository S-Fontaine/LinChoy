import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { isServerOnline } from "../utils/docker.js";
import User from "../models/User.js";
import Palworld from "../models/Palworld.js";
const router = Router();

router.get("/palworld", requireAuth, async (req: AuthRequest, res) => {
  try {
    const online = await isServerOnline("host.docker.internal", 8212);
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }
    const data = await Palworld.find();
    if (!online) {
      return res.status(530).json({
        result: false,
        data: {
          name: data[0]?.name,
          image: `/assets/${data[0]?.name.toLowerCase()}.png`,
          servername: data[0]?.info.servername,
          description: data[0]?.info.description,
          totalPlayer: data[0]?.metrics.currentplayernum,
          playerOnLine: data[0]?.players.length,
        },
      });
    }

    return res.status(200).json({
      result: true,
      data: {
        name: data[0]?.name,
        image: `/assets/${data[0]?.name.toLowerCase()}.png`,
        servername: data[0]?.info.servername,
        description: data[0]?.info.description,
        totalPlayer: data[0]?.metrics.currentplayernum,
        playerOnLine: data[0]?.players.length,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

export default router;
