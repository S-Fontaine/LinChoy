import { Router, type Request, type Response } from "express";
import GameServer from "../models/GameServer.js";
import { requireAdmin } from "../middlewares/auth.js";
import { handleMongooseError } from "../utils/handleMongooseError.js";
import {
  runPowerSequence,
  isPowerActionRunning,
  type PowerAction,
} from "../utils/gameServers/serverPower.js";

const router = Router();

router.use(requireAdmin);

const POWER_MESSAGES: Record<PowerAction, string> = {
  restart: "Redémarrage programmé — annonces aux joueurs sur 5 minutes.",
  "emergency-restart": "Redémarrage d'urgence programmé — 30 secondes.",
  shutdown: "Extinction programmée — annonces aux joueurs sur 5 minutes.",
};

function createPowerHandler(action: PowerAction) {
  return async (req: Request, res: Response) => {
    try {
      const server = await GameServer.findById(req.params.id);
      if (!server) {
        return res
          .status(404)
          .json({ result: false, message: "Serveur introuvable" });
      }
      if (isPowerActionRunning(server.gameData.containerName)) {
        return res.status(409).json({
          result: false,
          message: "Une action est déjà en cours sur ce serveur.",
        });
      }

      // Fire-and-forget : la séquence dure jusqu'à 5 minutes et gère ses
      // propres erreurs en interne, la route ne doit pas attendre la fin.
      void runPowerSequence(server, action);

      return res.status(202).json({ result: true, message: POWER_MESSAGES[action] });
    } catch (err) {
      return handleMongooseError(err, res);
    }
  };
}

router.get("/game-servers", async (_req, res) => {
  try {
    const servers = await GameServer.find();
    return res.status(200).json({ result: true, servers });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

router.post("/game-servers", async (req, res) => {
  const { name, connectionInfo, playerInfo, serverInfo, gameData, hostInfo } =
    req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res
      .status(400)
      .json({ result: false, message: "Nom du serveur requis" });
  }

  try {
    const server = await GameServer.create({
      name,
      connectionInfo,
      playerInfo,
      serverInfo,
      gameData,
      hostInfo,
    });
    return res.status(201).json({ result: true, server });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

router.patch("/game-servers/:id", async (req, res) => {
  const { name, connectionInfo, playerInfo, serverInfo, gameData, hostInfo } =
    req.body;

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return res
      .status(400)
      .json({ result: false, message: "Nom du serveur invalide" });
  }

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (connectionInfo !== undefined) update.connectionInfo = connectionInfo;
  if (playerInfo !== undefined) update.playerInfo = playerInfo;
  if (serverInfo !== undefined) update.serverInfo = serverInfo;
  if (gameData !== undefined) update.gameData = gameData;
  if (hostInfo !== undefined) update.hostInfo = hostInfo;

  try {
    const server = await GameServer.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!server) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }
    return res.status(200).json({ result: true, server });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

router.post("/game-servers/:id/restart", createPowerHandler("restart"));
router.post(
  "/game-servers/:id/emergency-restart",
  createPowerHandler("emergency-restart"),
);
router.post("/game-servers/:id/shutdown", createPowerHandler("shutdown"));

router.delete("/game-servers/:id", async (req, res) => {
  try {
    const server = await GameServer.findByIdAndDelete(req.params.id);
    if (!server) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }
    return res.status(204).send();
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

export default router;
