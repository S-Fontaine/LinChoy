import { describe, it, expect, jest } from "@jest/globals";
import type { Response, NextFunction } from "express";
import { requireAdmin, type AuthRequest } from "../../src/middlewares/auth.js";
import { generateAccessToken } from "../../src/utils/auth/jwt.js";

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn<Response["status"]>().mockReturnValue(res);
  res.json = jest.fn<Response["json"]>().mockReturnValue(res);
  return res;
}

describe("Test middleware: requireAdmin", () => {
  it("Appelle next() avec un token admin valide", () => {
    const token = generateAccessToken({ userId: "abc123", role: "admin" });
    const req = { cookies: { accessToken: token } } as unknown as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.role).toBe("admin");
  });

  it("Renvoie 404 si le cookie accessToken est absent", () => {
    const req = { cookies: {} } as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 404 si le token est invalide", () => {
    const req = {
      cookies: { accessToken: "token.invalide.bidon" },
    } as unknown as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 404 (pas 403) si le token est valide mais l'utilisateur n'est pas admin", () => {
    const token = generateAccessToken({ userId: "abc123", role: "user" });
    const req = { cookies: { accessToken: token } } as unknown as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it("Renvoie 404 si le token est valide mais n'a aucun rôle (comptes existants pré-migration)", () => {
    const token = generateAccessToken({ userId: "abc123" });
    const req = { cookies: { accessToken: token } } as unknown as AuthRequest;
    const res = createMockRes();
    const next = jest.fn() as NextFunction;

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
});
