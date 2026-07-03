import { describe, it, expect, jest } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import { mailer } from "../../../src/utils/mailer.js";
const BASE_URL = "/api/auth/email/resend-verification";

describe("Test route: POST /api/auth/email/resend-verification", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
  };

  it("Renvoie un email de vérification pour un utilisateur non vérifié", async () => {
    await User.create(payload);

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toMatch(/Email de vérification renvoyé/i);
  });

  it("Refuse de renvoyer un email de vérification pour un utilisateur déjà vérifié", async () => {
    await User.create(payload);
    const user = await User.findOne({ email: payload.email });
    if (user) {
      user.isVerified = true;
      await user.save();
    }
    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toMatch(/Utilisateur déjà vérifié/i);
  });

  it("Refuse de renvoyer un email de vérification pour un utilisateur inexistant", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });
    expect(res.status).toBe(404);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toMatch(/Utilisateur introuvable/i);
  });

  it("Refuse de renvoyer un email de vérification sans email", async () => {
    const res = await request(app).post(BASE_URL).send({});
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toMatch(/Champs requis/i);
  });
  it("Refuse de renvoyer un email de vérification avec un email vide", async () => {
    const res = await request(app).post(BASE_URL).send({ email: "   " });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toMatch(/Champs requis/i);
  });
  it("Refuse de renvoyer un email de vérification avec un email undefined", async () => {
    const res = await request(app).post(BASE_URL).send({ email: undefined });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toMatch(/Champs requis/i);
  });
  it("Renvoye une 500 si la base de données crash", async () => {
    jest
      .spyOn(User, "findOne")
      .mockRejectedValueOnce(new Error("Crash simulé"));

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erreur serveur");
  });

  it("Renvoye une 500 si le service d'email crash", async () => {
    await User.create(payload);

    jest
      .spyOn(mailer, "sendVerificationEmail")
      .mockRejectedValueOnce(new Error("SMTP Server Down"));
    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      result: false,
      message:
        "Impossible d'envoyer l'email pour le moment. Réessayez plus tard.",
    });
  });
});
