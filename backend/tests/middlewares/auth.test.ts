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
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.userId).toBe("abc123");
  });

  it("Renvoie 401 si le header Authorization est absent", () => {
    const req = { headers: {} } as AuthRequest;
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

  it("Renvoie 401 si le header ne commence pas par 'Bearer '", () => {
    const req = { headers: { authorization: "Basic abc123" } } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 401 si le token est absent après 'Bearer '", () => {
    const req = { headers: { authorization: "Bearer " } } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 401 si le token est invalide", () => {
    const req = {
      headers: { authorization: "Bearer token.invalide.bidon" },
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
      headers: { authorization: `Bearer ${expiredToken}` },
    } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
