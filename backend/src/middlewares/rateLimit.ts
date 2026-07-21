import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

export const resendVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: isTest ? Number.MAX_SAFE_INTEGER : 3,
  message: {
    result: false,
    message: "Trop de tentatives. Réessaie plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? Number.MAX_SAFE_INTEGER : 10,
  message: {
    result: false,
    message: "Trop de tentatives. Réessaie plus tard.",
  },
});
