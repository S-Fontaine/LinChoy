import { describe, it, expect, jest } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import { mailer } from "../../../src/utils/mailer.js";
const BASE_URL = "/auth/forgot-password";

describe("Test route: POST /auth/forgot-password", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
    isVerified: true,
  };

  it("Renvoie 200 et envoie un email si l'utilisateur existe", async () => {
    await User.create(payload);
    const spy = jest.spyOn(mailer, "sendPasswordResetEmail");

    const res = await request(app).post(BASE_URL).send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      payload.email,
      expect.any(String),
      payload.username,
    );
  });

  it("Renvoie 200 avec le même message si l'utilisateur n'existe pas (anti-énumération)", async () => {
    const spy = jest.spyOn(mailer, "sendPasswordResetEmail");

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: "inconnu@linchoy.com" });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toMatch(/si un compte existe/i);
    expect(spy).not.toHaveBeenCalled();
  });

  it("N'envoie pas d'email pour un compte OAuth (authProvider non local)", async () => {
    await User.create({
      username: "oauthUser",
      email: "oauth@linchoy.com",
      authProvider: "google",
      isVerified: true,
    });
    const spy = jest.spyOn(mailer, "sendPasswordResetEmail");

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: "oauth@linchoy.com" });

    expect(res.status).toBe(200);
    expect(spy).not.toHaveBeenCalled();
  });

  it("Refuse une requête sans email", async () => {
    const res = await request(app).post(BASE_URL).send({});

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Email requis");
  });

  it("Refuse un email vide", async () => {
    const res = await request(app).post(BASE_URL).send({ email: "   " });

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
  });

  it("Répond 200 même si l'envoi de l'email échoue côté serveur", async () => {
    await User.create(payload);
    jest
      .spyOn(mailer, "sendPasswordResetEmail")
      .mockRejectedValueOnce(new Error("SMTP down"));

    const res = await request(app).post(BASE_URL).send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
  });
});