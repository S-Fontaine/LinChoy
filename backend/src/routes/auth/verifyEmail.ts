import { Router } from "express";
import User from "../../models/User.js";
import { generateVerifyToken, verifyEmailToken } from "../../utils/auth/jwt.js";
import { mailer } from "../../utils/mailer.js";
import { resendVerificationLimiter } from "../../middlewares/rateLimit.js";

const router = Router();

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

export default router;