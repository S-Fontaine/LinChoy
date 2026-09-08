import { Router } from "express";
import type { HydratedDocument } from "mongoose";
import GameServer, { type IGameServer } from "../models/GameServer.js";
import { gameServerEvents } from "../utils/gameServers/gameServerEvents.js";
import { sseLimiter } from "../middlewares/rateLimit.js";

const router = Router();

function toGameData(server: HydratedDocument<IGameServer>) {
  return {
    name: server.name,
    servername: server.serverInfo.displayName || server.name,
    description: server.serverInfo.description || "",
    image: server.serverInfo.image,
    totalPlayer: server.playerInfo.maxPlayers ?? 0,
    playerOnLine: server.playerInfo.playerCount,
    players: (server.playerInfo.players ?? []).map((p) => p.name),
    online: server.statusInfo.online,
    state: server.statusInfo.state,
    comingSoon: server.statusInfo.comingSoon,
    slug: server.gameData.slug,
  };
}

router.get("/", async (_req, res) => {
  try {
    const servers = await GameServer.find().select(
      "name gameData.slug gameData.type serverInfo.image serverInfo.description statusInfo.state statusInfo.comingSoon",
    );

    return res.status(200).json({ result: true, servers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

router.get("/stream", sseLimiter, async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  try {
    const servers = await GameServer.find();
    for (const server of servers) {
      res.write(`data: ${JSON.stringify(toGameData(server))}\n\n`);
    }
  } catch (err) {
    console.error("[stream] Échec de l'envoi du snapshot initial :", err);
  }

  const onUpdate = (server: HydratedDocument<IGameServer>) => {
    res.write(`data: ${JSON.stringify(toGameData(server))}\n\n`);
  };
  gameServerEvents.on("update", onUpdate);

  req.on("close", () => {
    gameServerEvents.off("update", onUpdate);
  });
});

router.get("/:slug", async (req, res) => {
  try {
    const server = await GameServer.findOne({
      "gameData.slug": req.params.slug,
    });
    if (!server) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }
    return res.status(200).json({ result: true, data: toGameData(server) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

export default router;
