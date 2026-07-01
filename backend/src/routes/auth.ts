import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const match = await bcrypt.compare(password, String(user.password));
  if (!match) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const payload = { userId: String(user._id) };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.json({ accessToken, refreshToken });
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token manquant" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({ userId: payload.userId });

    res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ error: "Refresh token invalide ou expiré" });
  }
});

export default router;
