import { Router } from "express";
import User from "../models/User.js";
import { generateVerifyToken } from "../utils/jwt.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { mailer } from "../utils/mailer.js";
import { handleMongooseError } from "../utils/handleMongooseError.js";

const router = Router();

router.patch("/update/:id", requireAuth, async (req: AuthRequest, res) => {
  const { username, email, password } = req.body;

  if (req.user?.userId !== req.params.id) {
    return res.status(403).json({ result: false, message: "Accès refusé" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ result: false, message: "Utilisateur introuvable" });
    }

    const usernameChanged =
      username !== undefined && username !== user.username;
    const emailChanged = email !== undefined && email !== user.email;
    const passwordProvided = password !== undefined; // toujours appliqué si fourni

    if (!usernameChanged && !emailChanged && !passwordProvided) {
      return res.status(400).json({
        result: false,
        message: "Aucune modification détectée",
      });
    }

    if (usernameChanged) user.username = username;
    if (emailChanged) user.email = email;
    if (passwordProvided) user.password = password;

    if (emailChanged) {
      user.isVerified = false;
    }

    await user.save();

    if (emailChanged) {
      const verifyToken = generateVerifyToken({ userId: user._id.toString() });
      try {
        await mailer.sendVerificationEmail(
          user.email,
          verifyToken,
          user.username,
        );
      } catch (err) {
        console.error("[mail]: Échec d'envoi de l'email de vérification", err);
        return res.status(200).json({
          result: true,
          message:
            "Utilisateur mis à jour, mais l'email de vérification n'a pas pu être envoyé.",
          data: {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
          },
        });
      }
    }

    return res.status(200).json({
      result: true,
      message: emailChanged
        ? "Utilisateur mis à jour. Vérifiez votre nouvel email pour le confirmer."
        : "Utilisateur mis à jour avec succès.",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    return handleMongooseError(err, res);
  }
});

export default router;
