import { describe, it, expect, jest } from "@jest/globals";
import type { Response, NextFunction } from "express";
import { requireAuth, type AuthRequest } from "../../src/middlewares/auth.js";
import { generateAccessToken } from "../../src/utils/jwt.js";

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn<Response["status"]>().mockReturnValue(res);
  res.json = jest.fn<Response["json"]>().mockReturnValue(res);
  return res;
}

describe("Test middleware: auth", () => {
  it("Appelle next() avec un token valide", () => {
    const token = generateAccessToken({ userId: "abc123" });
    const req = {
      cookies: { accessToken: token },
    } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.userId).toBe("abc123");
  });

  it("Renvoie 401 si le cookie accessToken est absent", () => {
    const req = { cookies: {} } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Token manquant",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 401 si l'objet cookies est totalement absent (aucun cookie envoyé)", () => {
    const req = { cookies: undefined } as unknown as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 401 si le token est invalide", () => {
    const req = {
      cookies: { accessToken: "token.invalide.bidon" },
    } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Token invalide ou expiré",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 401 si le token est expiré", () => {
    const expiredToken = generateAccessToken(
      { userId: "abc123" },
      { expiresIn: "-1s" },
    );
    const req = {
      cookies: { accessToken: expiredToken },
    } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});