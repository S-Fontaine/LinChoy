import { describe, it, expect } from "@jest/globals";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerifyToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../src/utils/jwt.js";

describe("Génération et vérification des tokens JWT", () => {
  const payload = { userId: "abc123" };

  describe("generateAccessToken / verifyAccessToken", () => {
    it("Génère un token valide et décodable", () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe("abc123");
    });

    it("A une expiration de 15 minutes", () => {
      const token = generateAccessToken(payload);
      const decoded = jwt.decode(token) as { iat: number; exp: number };
      const duration = decoded.exp - decoded.iat;

      expect(duration).toBe(15 * 60);
    });

    it("Rejette un token expiré", () => {
      const expiredToken = generateAccessToken(payload, { expiresIn: "-1s" });

      expect(() => verifyAccessToken(expiredToken)).toThrow();
    });

    it("Rejette un token invalide", () => {
      expect(() => verifyAccessToken("token.invalide.bidon")).toThrow();
    });
  });

  describe("generateRefreshToken / verifyRefreshToken", () => {
    it("Génère un token valide et décodable", () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe("abc123");
    });

    it("A une expiration de 7 jours", () => {
      const token = generateRefreshToken(payload);
      const decoded = jwt.decode(token) as { iat: number; exp: number };
      const duration = decoded.exp - decoded.iat;

      expect(duration).toBe(7 * 24 * 60 * 60);
    });

    it("Rejette un token expiré", () => {
      const expiredToken = generateRefreshToken(payload, { expiresIn: "-1s" });

      expect(() => verifyRefreshToken(expiredToken)).toThrow();
    });
  });

  describe("generateVerifyToken", () => {
    it("Génère un token valide", () => {
      const token = generateVerifyToken(payload);
      const decoded = jwt.decode(token) as { userId: string };

      expect(decoded.userId).toBe("abc123");
    });

    it("A une expiration de 1 jour", () => {
      const token = generateVerifyToken(payload);
      const decoded = jwt.decode(token) as { iat: number; exp: number };
      const duration = decoded.exp - decoded.iat;

      expect(duration).toBe(24 * 60 * 60);
    });
  });

  describe("Isolation des secrets entre les types de tokens", () => {
    it("Un accessToken ne peut PAS être vérifié comme refreshToken", () => {
      const accessToken = generateAccessToken(payload);

      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });

    it("Un refreshToken ne peut PAS être vérifié comme accessToken", () => {
      const refreshToken = generateRefreshToken(payload);

      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });
});