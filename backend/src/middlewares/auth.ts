import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/auth/jwt.js";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ result: false, message: "Token manquant" });
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res
      .status(401)
      .json({ result: false, message: "Token invalide ou expiré" });
  }
}

const NOT_FOUND = { result: false, message: "Not found" };

// Combine l'auth et la vérification du rôle en une seule réponse 404 : un token
// manquant/invalide et un rôle non-admin doivent être indiscernables d'une route
// qui n'existe pas (pas de 401/403 qui confirmerait l'existence de /admin/*).
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(404).json(NOT_FOUND);
  }
  try {
    const payload = verifyAccessToken(token);
    if (payload.role !== "admin") {
      return res.status(404).json(NOT_FOUND);
    }
    req.user = payload;
    next();
  } catch {
    return res.status(404).json(NOT_FOUND);
  }
}
