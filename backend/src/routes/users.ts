import { Router } from "express";
import mongoose from "mongoose";
import User from "../../src/models/User.js";
import { generateVerifyToken, verifyEmailToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ result: false, message: "Champs manquants" });
  }
  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(409).json({
        result: false,
        message: "Connectez-vous s'il vous plaît",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    const verifyToken = generateVerifyToken({ userId: newUser._id.toString() });
    await sendVerificationEmail(newUser.email, verifyToken, newUser.username);

    return res.status(201).json({
      result: true,
      message: "Compte créé. Vérifiez votre email pour l'activer.",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errors: Record<string, string> = {};
      Object.entries(err.errors).forEach(([field, errorObj]) => {
        errors[field] = errorObj.message;
      });
      const message = Object.values(errors);
      return res
        .status(400)
        .json({ result: false, message: message.join(" et ") });
    }

    console.error(err);
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

export default router;
