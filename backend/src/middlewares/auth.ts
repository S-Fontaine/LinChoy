import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js";

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
