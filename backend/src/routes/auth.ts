import { Router } from "express";
import { handleMongooseError } from "../utils/handleMongooseError.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  generateVerifyToken,
  generateAccessToken,
  generateRefreshToken,
  verifyEmailToken,
} from "../utils/jwt.js";
import { mailer } from "../utils/mailer.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!email?.trim() || !username?.trim() || !password) {
    return res.status(400).json({ result: false, message: "Champs manquants" });
  }
  let newUser;

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

    newUser = await User.create({
      username,
      email,
      password,
    });
  } catch (err) {return handleMongooseError(err, res);}
  try {
    const verifyToken = generateVerifyToken({ userId: newUser._id.toString() });
    await mailer.sendVerificationEmail(
      newUser.email,
      verifyToken,
      newUser.username,
    );
  } catch (err) {
    console.error("[mail]: Échec d'envoi de l'email de vérification", err);
    return res.status(201).json({
      result: true,
      message:
        "Compte créé, mais l'email de vérification n'a pas pu être envoyé. Contactez le support ou réessayez plus tard.",
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
    data: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    },
  });
});

router.post("/login", async (req, res) => {
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

    return res.status(200).json({ result: true, accessToken, refreshToken });
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

router.post("/email/resend-verification", async (req, res) => {
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
    await mailer.sendVerificationEmail(user.email, verifyToken, user.username);
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
});

export default router;
