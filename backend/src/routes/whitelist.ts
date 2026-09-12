import { Router } from "express";
import GameServer from "../models/GameServer.js";
import ServerWhitelist from "../models/ServerWhitelist.js";
import User, { type IUser } from "../models/User.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { handleMongooseError } from "../utils/handleMongooseError.js";
import { syncWhitelist } from "../games/index.js";

const router = Router();

function getIdentifier(
  user: Pick<IUser, "steamId" | "minecraftUsername">,
  gameType: string,
): string | null {
  return gameType === "minecraft" ? user.minecraftUsername : user.steamId;
}

router.get("/:slug/whitelist", requireAuth, async (req: AuthRequest, res) => {
  try {
    const server = await GameServer.findOne({
      "gameData.slug": req.params.slug,
    });
    if (!server) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }

    const identifier = getIdentifier(user, server.gameData.type);
    if (!identifier) {
      return res.status(200).json({
        result: true,
        linked: false,
        whitelisted: false,
        connection: null,
      });
    }

    const entry = await ServerWhitelist.findOne({
      user: user._id,
      gameServer: server._id,
    });

    return res.status(200).json({
      result: true,
      linked: true,
      whitelisted: !!entry,
      connection: entry
        ? {
            address: server.connectionInfo.address,
            port: server.connectionInfo.port,
            password: server.connectionInfo.password || null,
          }
        : null,
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

router.post("/:slug/whitelist", requireAuth, async (req: AuthRequest, res) => {
  try {
    const server = await GameServer.findOne({
      "gameData.slug": req.params.slug,
    });
    if (!server) {
      return res
        .status(404)
        .json({ result: false, message: "Serveur introuvable" });
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }

    const identifier = getIdentifier(user, server.gameData.type);
    if (!identifier) {
      return res.status(400).json({
        result: false,
        message: "Lie d'abord ton compte pour ce jeu",
        linkRequired: true,
      });
    }

    const existing = await ServerWhitelist.findOne({
      user: user._id,
      gameServer: server._id,
    });

    if (!existing) {
      await ServerWhitelist.create({ user: user._id, gameServer: server._id });
      await syncWhitelist(server).catch((err) =>
        console.error(
          `[whitelist] échec de la synchro pour ${server.gameData.slug}`,
          err,
        ),
      );
    }

    return res.status(200).json({
      result: true,
      message: "Tu es whitelisté sur ce serveur !",
      connection: {
        address: server.connectionInfo.address,
        port: server.connectionInfo.port,
        password: server.connectionInfo.password || null,
      },
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

export default router;
