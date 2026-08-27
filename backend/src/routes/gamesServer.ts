import { Router } from "express";
import GameServer, { type GameServerType } from "../models/GameServer.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const servers = await GameServer.find().select(
      "name type image status comingSoon",
    );

    return res.status(200).json({ result: true, servers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

router.get("/:type", async (req, res) => {
  try {
    const server = await GameServer.findOne({
      type: req.params.type as GameServerType,
    });
    if (!server) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }

    return res.status(200).json({
      result: true,
      data: {
        name: server.name,
        servername: server.status.displayName || server.name,
        description: server.status.description || "",
        totalPlayer: server.status.maxPlayers ?? 0,
        playerOnLine: server.status.playerCount,
        online: server.status.online,
        comingSoon: server.comingSoon,
        image: server.image,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

export default router;
