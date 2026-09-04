import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { handleMongooseError } from "../utils/handleMongooseError.js";
import {
  addToServerWhitelist,
  removeFromServerWhitelist,
} from "../utils/minecraftWhitelist.js";
import { resolveMinecraftPlayer } from "../utils/minecraftAuth.js";
import { getMinecraftLinkExpiresAt } from "../utils/minecraftVerification.js";
const router = Router();

router.post("/link", requireAuth, async (req: AuthRequest, res) => {
  const { input } = req.body as { input?: string };
  const linkedAt = new Date();

  if (!input || typeof input !== "string" || !input.trim()) {
    return res
      .status(400)
      .json({ result: false, message: "Pseudo ou UUID Minecraft requis" });
  }

  try {
    const { uuid, username } = await resolveMinecraftPlayer(input);

    const alreadyLinked = await User.findOne({ minecraftUuid: uuid });
    if (alreadyLinked && alreadyLinked._id.toString() !== req.user?.userId) {
      return res.status(409).json({
        result: false,
        message: "Ce compte Minecraft est déjà lié à un autre utilisateur",
      });
    }

    await User.findByIdAndUpdate(req.user?.userId, {
      minecraftUuid: uuid,
      minecraftUsername: username,
      minecraftVerified: false,
      minecraftLinkedAt: linkedAt,
    });

    await addToServerWhitelist(username);

    return res.status(200).json({
      result: true,
      message: "Compte lié, connecte-toi sur le serveur pour confirmer",
      minecraftUuid: uuid,
      minecraftUsername: username,
      minecraftVerified: false,
      minecraftLinkExpiresAt: getMinecraftLinkExpiresAt(linkedAt),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "not_found") {
      return res.status(404).json({
        result: false,
        message: "Aucun joueur Minecraft ne correspond à ce pseudo/UUID",
      });
    }
    if (err instanceof Error && err.message === "mojang_unavailable") {
      return res.status(502).json({
        result: false,
        message: "Le service Mojang est indisponible, réessaie plus tard",
      });
    }
    return handleMongooseError(err, res);
  }
});

router.delete("/link", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (user?.minecraftUsername) {
      await removeFromServerWhitelist(user.minecraftUsername);
    }
    await User.findByIdAndUpdate(req.user?.userId, {
      minecraftUuid: null,
      minecraftUsername: null,
      minecraftVerified: false,
      minecraftLinkedAt: null,
    });
    return res
      .status(200)
      .json({ result: true, message: "Compte Minecraft délié" });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

export default router;
