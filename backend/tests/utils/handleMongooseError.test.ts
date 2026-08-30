import { describe, it, expect, jest } from "@jest/globals";
import mongoose from "mongoose";
import type { Response } from "express";
import { handleMongooseError } from "../../src/utils/handleMongooseError.js";
import { MongoServerError } from "mongodb";

function createMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn<Response["status"]>().mockReturnValue(res);
  res.json = jest.fn<Response["json"]>().mockReturnValue(res);
  return res;
}

describe("Test utilitaire: handleMongooseError", () => {
  it("Renvoie 400 pour une ValidationError", () => {
    const res = createMockRes();
    const fakeError = new mongoose.Error.ValidationError();
    fakeError.errors.email = new mongoose.Error.ValidatorError({
      message: "Email invalide",
      path: "email",
    });

    handleMongooseError(fakeError, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Email invalide",
    });
  });

  it("Renvoie 500 pour toute autre erreur", () => {
    const res = createMockRes();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    handleMongooseError(new Error("Erreur inattendue"), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Erreur serveur",
    });

    consoleErrorSpy.mockRestore();
  });

  it("Renvoie 500 pour toute autre erreur", () => {
    const res = createMockRes();
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    handleMongooseError(new Error("Erreur inattendue"), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Erreur serveur",
    });

    consoleErrorSpy.mockRestore();
  });
  it("renvoie un message spécifique pour un doublon d'email", () => {
    const res = createMockRes();
    const err = new Error("duplicate key") as Partial<MongoServerError>;
    err.code = 11000;
    err.keyPattern = { email: 1 };

    handleMongooseError(err, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Cet email est déjà utilisé",
    });
  });

  it("renvoie un message spécifique pour un doublon de username", () => {
    const res = createMockRes();
    const err = new Error("duplicate key") as Partial<MongoServerError>;
    err.code = 11000;
    err.keyPattern = { username: 1 };

    handleMongooseError(err, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: "Ce nom d'utilisateur est déjà pris",
    });
  });
});
