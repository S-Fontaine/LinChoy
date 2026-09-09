import { describe, it, expect, jest } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import { mailer } from "../../../src/utils/mailer.js";
const BASE_URL = "/auth/email/resend-verification";

describe("Test route: POST /auth/email/resend-verification", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
  };

  it("Renvoie 200 et envoie un email pour un utilisateur non vérifié", async () => {
    await User.create(payload);
    const spy = jest.spyOn(mailer, "sendVerificationEmail");

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("Renvoie 200 avec le même message sans renvoyer d'email pour un utilisateur déjà vérifié (anti-énumération)", async () => {
    await User.create(payload);
    const user = await User.findOne({ email: payload.email });
    if (user) {
      user.isVerified = true;
      await user.save();
    }
    const spy = jest.spyOn(mailer, "sendVerificationEmail");

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toMatch(/si un compte existe/i);
    expect(spy).not.toHaveBeenCalled();
  });

  it("Renvoie 200 avec le même message pour un utilisateur inexistant (anti-énumération)", async () => {
    const spy = jest.spyOn(mailer, "sendVerificationEmail");

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.message).toMatch(/si un compte existe/i);
    expect(spy).not.toHaveBeenCalled();
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

  it("Répond 200 même si la base de données crash", async () => {
    jest
      .spyOn(User, "findOne")
      .mockRejectedValueOnce(new Error("Crash simulé"));

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
  });

  it("Répond 200 même si le service d'email crash", async () => {
    await User.create(payload);

    jest
      .spyOn(mailer, "sendVerificationEmail")
      .mockRejectedValueOnce(new Error("SMTP Server Down"));
    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
  });
});
