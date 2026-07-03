import mongoose from "mongoose";
import type { Response } from "express";

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyPattern?: Record<string, number>;
}

export function handleMongooseError(err: unknown, res: Response) {
  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string> = {};
    Object.entries(err.errors).forEach(([field, errorObj]) => {
      errors[field] = errorObj.message;
    });
    return res
      .status(400)
      .json({ result: false, message: Object.values(errors).join(", ") });
  }

  if (
    err instanceof Error &&
    "code" in err &&
    (err as MongoDuplicateKeyError).code === 11000
  ) {
    const duplicateErr = err as MongoDuplicateKeyError;
    const field = duplicateErr.keyPattern
      ? (Object.keys(duplicateErr.keyPattern)[0] ?? "champ")
      : "champ";

    const messages: Record<string, string> = {
      email: "Cet email est déjà utilisé",
      username: "Ce nom d'utilisateur est déjà pris",
    };

    return res.status(409).json({
      result: false,
      message: messages[field] || `Ce ${field} est déjà utilisé`,
    });
  }

  console.error(err);
  return res.status(500).json({ result: false, message: "Erreur serveur" });
}
