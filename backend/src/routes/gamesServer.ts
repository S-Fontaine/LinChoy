import { Router } from "express";
import GameServer from "../models/GameServer.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const servers = await GameServer.find().select(
      "name slug type image status comingSoon",
    );

    return res.status(200).json({ result: true, servers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const server = await GameServer.findOne({ slug: req.params.slug });
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
        players: server.status.players || [],
        state: server.status.state,
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
