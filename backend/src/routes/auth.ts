import { Router } from "express";
import { handleMongooseError } from "../utils/handleMongooseError.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  generateVerifyToken,
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyEmailToken,
  verifyRefreshToken,
  verifyResetToken,
  computePasswordFingerprint,
} from "../utils/jwt.js";
import { mailer } from "../utils/mailer.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import {
  authLimiter,
  resendVerificationLimiter,
  forgotPasswordLimiter,
} from "../middlewares/rateLimit.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookieOptions.js";
import { emailValidator } from "../utils/validateEmailDomain.js";
import { getMinecraftLinkExpiresAt } from "../utils/minecraftVerification.js";

const router = Router();

router.post("/signup", authLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  if (!email?.trim() || !username?.trim() || !password) {
    return res.status(400).json({ result: false, message: "Champs manquants" });
  }

  let newUser;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ result: false, message: "Connectez-vous s'il vous plaît" });
    }
  } catch (err) {
    return handleMongooseError(err, res);
  }

  const hasMailServer = await emailValidator.domainHasMailServer(email);
  if (!hasMailServer) {
    return res.status(400).json({
      result: false,
      message:
        "Cette adresse email ne semble pas valide (domaine introuvable).",
    });
  }

  try {
    newUser = await User.create({ username, email, password });
  } catch (err) {
    return handleMongooseError(err, res);
  }

  try {
    const verifyToken = generateVerifyToken({ userId: newUser._id.toString() });
    await mailer.sendVerificationEmail(
      newUser.email,
      verifyToken,
      newUser.username,
    );
  } catch (err) {
    console.error("[mail]: Échec d'envoi de l'email de vérification", err);

    const isRecipientRejected =
      err instanceof Error && "code" in err && err.code === "EENVELOPE";

    return res.status(201).json({
      result: true,
      message: isRecipientRejected
        ? "Compte créé, mais cette adresse email semble invalide. Vérifiez son orthographe."
        : "Compte créé, mais l'email de vérification n'a pas pu être envoyé. Réessayez plus tard.",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  }

  return res.status(201).json({
    result: true,
    message: "Compte créé. Vérifiez votre email pour l'activer.",
    data: { id: newUser._id, username: newUser.username, email: newUser.email },
  });
});

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

router.get("/email/verify", async (req, res) => {
  const { token } = req.query;

  if (typeof token !== "string") {
    return res.status(400).json({ result: false, message: "Token manquant" });
  }

  try {
    const payload = verifyEmailToken(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }
    if (user.isVerified === true) {
      return res
        .status(409)
        .json({ result: false, message: "Email déjà verifié" });
    }
    user.isVerified = true;
    await user.save();
    return res
      .status(200)
      .json({ result: true, message: "Email vérifié avec succès" });
  } catch {
    return res
      .status(400)
      .json({ result: false, message: "Token invalide ou expiré" });
  }
});

router.post(
  "/email/resend-verification",
  resendVerificationLimiter,
  async (req, res) => {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ result: false, message: "Champs requis" });
    }
    let user;
    try {
      user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ result: false, message: "Utilisateur introuvable" });
      }

      if (user.isVerified) {
        return res
          .status(400)
          .json({ result: false, message: "Utilisateur déjà vérifié" });
      }
    } catch (err) {
      console.error("[DB Resend]: Erreur recherche utilisateur", err);
      return res.status(500).json({ result: false, message: "Erreur serveur" });
    }
    try {
      const verifyToken = generateVerifyToken({ userId: user._id.toString() });
      await mailer.sendVerificationEmail(
        user.email,
        verifyToken,
        user.username,
      );
    } catch (err) {
      console.error("[Mail Resend]: Échec de l'envoi de l'email", err);
      return res.status(500).json({
        result: false,
        message:
          "Impossible d'envoyer l'email pour le moment. Réessayez plus tard.",
      });
    }

    return res
      .status(200)
      .json({ result: true, message: "Email de vérification renvoyé" });
  },
);

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

router.post("/logout", (_req, res) => {
  res.clearCookie("accessToken", accessTokenCookieOptions);
  res.clearCookie("refreshToken", refreshTokenCookieOptions);
  return res.status(204).send();
});

router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email?.trim()) {
    return res.status(400).json({ result: false, message: "Email requis" });
  }

  try {
    const user = await User.findOne({ email });

    if (user && user.authProvider === "local" && user.password) {
      const resetToken = generateResetToken({
        userId: user._id.toString(),
        pwdFingerprint: computePasswordFingerprint(user.password),
      });
      try {
        await mailer.sendPasswordResetEmail(
          user.email,
          resetToken,
          user.username,
        );
      } catch (err) {
        console.error("[mail]: Échec d'envoi (forgot-password)", err);
      }
    }
  } catch (err) {
    console.error("[forgot-password]: Erreur serveur", err);
  }

  return res.status(200).json({
    result: true,
    message:
      "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.",
  });
});

router.post("/reset-password", authLimiter, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ result: false, message: "Champs manquants" });
  }

  let payload;
  try {
    payload = verifyResetToken(token);
  } catch {
    return res
      .status(400)
      .json({ result: false, message: "Lien invalide ou expiré" });
  }

  try {
    const user = await User.findById(payload.userId);
    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }

    if (computePasswordFingerprint(user.password) !== payload.pwdFingerprint) {
      return res.status(400).json({
        result: false,
        message: "Ce lien a déjà été utilisé ou n'est plus valide.",
      });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      result: true,
      message: "Mot de passe réinitialisé avec succès.",
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

router.get("/reset-password/verify", async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ result: false, message: "Lien invalide" });
  }

  let payload;
  try {
    payload = verifyResetToken(token);
  } catch {
    return res.status(400).json({
      result: false,
      message: "Ce lien a expiré, redemande une réinitialisation.",
    });
  }

  try {
    const user = await User.findById(payload.userId);
    if (
      !user ||
      computePasswordFingerprint(user.password) !== payload.pwdFingerprint
    ) {
      return res.status(400).json({
        result: false,
        message: "Ce lien a déjà été utilisé ou n'est plus valide.",
      });
    }
    return res.status(200).json({ result: true, message: "Lien valide" });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

export default router;
