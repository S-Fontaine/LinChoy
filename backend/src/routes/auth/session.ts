import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/auth/jwt.js";
import { requireAuth, type AuthRequest } from "../../middlewares/auth.js";
import { authLimiter } from "../../middlewares/rateLimit.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../utils/auth/cookieOptions.js";
import { getMinecraftLinkExpiresAt } from "../../utils/linking/minecraftVerification.js";

const router = Router();

router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password) {
    return res.status(400).json({ result: false, message: "Champs requis" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res
        .status(401)
        .json({ result: false, message: "Identifiants invalides" });
    }

    const match = await bcrypt.compare(password, String(user.password));
    if (!match) {
      return res
        .status(401)
        .json({ result: false, message: "Identifiants invalides" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        result: false,
        message: "Veuillez vérifier votre email avant de vous connecter",
      });
    }
    const payload = { userId: String(user._id) };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
      result: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoriteServer: user.favoriteServer,
        steamId: user.steamId,
        minecraftUuid: user.minecraftUuid,
        minecraftUsername: user.minecraftUsername,
        minecraftVerified: user.minecraftVerified,
        minecraftLinkExpiresAt: user.minecraftVerified
          ? null
          : getMinecraftLinkExpiresAt(user.minecraftLinkedAt),
      },
    });
  } catch (err) {
    console.error("[login]: Erreur serveur", err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);
  return res.status(204).send();
});

router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ result: false, message: "Refresh token manquant" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({ userId: payload.userId });

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);

    return res.status(200).json({ result: true });
  } catch {
    return res
      .status(401)
      .json({ result: false, message: "Refresh token invalide ou expiré" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }

    return res.status(200).json({
      result: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favoriteServer: user.favoriteServer,
        steamId: user.steamId,
        minecraftUuid: user.minecraftUuid,
        minecraftUsername: user.minecraftUsername,
        minecraftVerified: user.minecraftVerified,
        minecraftLinkExpiresAt: user.minecraftVerified
          ? null
          : getMinecraftLinkExpiresAt(user.minecraftLinkedAt),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});

export default router;