import { Router } from "express";
import { handleMongooseError } from "../../utils/handleMongooseError.js";
import User from "../../models/User.js";
import {
  generateResetToken,
  verifyResetToken,
  computePasswordFingerprint,
} from "../../utils/auth/jwt.js";
import { mailer } from "../../utils/mailer.js";
import {
  authLimiter,
  forgotPasswordLimiter,
} from "../../middlewares/rateLimit.js";

const router = Router();

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