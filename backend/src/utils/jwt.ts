import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN as string;
const JWT_VERIFY_SECRET = process.env.JWT_VERIFY_SECRET as string;
const JWT_VERIFY_EXPIRES_IN = process.env.JWT_VERIFY_EXPIRES_IN as string;
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET as string;
const JWT_RESET_EXPIRES_IN = process.env.JWT_RESET_EXPIRES_IN as string;

if (
  !JWT_SECRET ||
  !JWT_REFRESH_SECRET ||
  !JWT_VERIFY_SECRET ||
  !JWT_RESET_SECRET ||
  !JWT_EXPIRES_IN ||
  !JWT_REFRESH_EXPIRES_IN ||
  !JWT_VERIFY_EXPIRES_IN ||
  !JWT_RESET_EXPIRES_IN
) {
  throw new Error(
    "JWT_SECRET, JWT_REFRESH_SECRET, JWT_VERIFY_SECRET, JWT_RESET_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, JWT_VERIFY_EXPIRES_IN ou JWT_RESET_EXPIRES_IN manquant dans le .env",
  );
}
export function computePasswordFingerprint(passwordHash: string): string {
  return crypto
    .createHmac("sha256", JWT_RESET_SECRET)
    .update(passwordHash)
    .digest("hex");
}

export interface JwtPayload {
  userId: string;
}
export interface ResetTokenPayload {
  userId: string;
  pwdFingerprint: string;
}

export function generateAccessToken(
  payload: JwtPayload,
  options?: jwt.SignOptions,
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
    ...options,
  });
}

export function generateRefreshToken(
  payload: JwtPayload,
  options?: jwt.SignOptions,
): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    ...options,
  });
}

export function generateVerifyToken(
  payload: JwtPayload,
  options?: jwt.SignOptions,
): string {
  return jwt.sign(payload, JWT_VERIFY_SECRET, {
    expiresIn: JWT_VERIFY_EXPIRES_IN as SignOptions["expiresIn"],
    ...options,
  });
}

export function generateResetToken(
  payload: ResetTokenPayload,
  options?: jwt.SignOptions,
): string {
  return jwt.sign(payload, JWT_RESET_SECRET, {
    expiresIn: JWT_RESET_EXPIRES_IN as SignOptions["expiresIn"],
    ...options,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

export function verifyEmailToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_VERIFY_SECRET) as unknown as JwtPayload;
}

export function verifyResetToken(token: string): ResetTokenPayload {
  return jwt.verify(token, JWT_RESET_SECRET) as unknown as ResetTokenPayload;
}
