import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import {
  generateResetToken,
  computePasswordFingerprint,
} from "../../../src/utils/jwt.js";
const BASE_URL = "/auth/reset-password";

describe("Test route: POST /auth/reset-password", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
    isVerified: true,
  };

  it("Réinitialise le mot de passe avec un token valide", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    const res = await request(app)
      .post(BASE_URL)
      .send({ token, password: "NouveauMotDePasse456!" });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: payload.email, password: "NouveauMotDePasse456!" });
    expect(loginRes.status).toBe(200);
  });

  it("Refuse de réutiliser un token déjà utilisé (usage unique)", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    await request(app)
      .post(BASE_URL)
      .send({ token, password: "NouveauMotDePasse456!" });

    const secondAttempt = await request(app)
      .post(BASE_URL)
      .send({ token, password: "AutreMotDePasse789!" });

    expect(secondAttempt.status).toBe(400);
    expect(secondAttempt.body.message).toBe(
      "Ce lien a déjà été utilisé ou n'est plus valide.",
    );
  });

  it("Refuse un token expiré", async () => {
    const user = await User.create(payload);
    const expiredToken = generateResetToken(
      {
        userId: user._id.toString(),
        pwdFingerprint: computePasswordFingerprint(user.password),
      },
      { expiresIn: "-1s" },
    );

    const res = await request(app)
      .post(BASE_URL)
      .send({ token: expiredToken, password: "NouveauMotDePasse456!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Lien invalide ou expiré");
  });

  it("Refuse un token invalide", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ token: "token.bidon.faux", password: "NouveauMotDePasse456!" });

    expect(res.status).toBe(400);
  });

  it("Refuse une requête sans token", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ password: "NouveauMotDePasse456!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Champs manquants");
  });

  it("Refuse une requête sans password", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    const res = await request(app).post(BASE_URL).send({ token });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Champs manquants");
  });

  it("Refuse un mot de passe qui ne respecte pas les règles de validation", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    const res = await request(app)
      .post(BASE_URL)
      .send({ token, password: "trop court" });

    expect(res.status).toBe(400);
  });

  it("Renvoie 404 si l'utilisateur a été supprimé entre-temps", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    await User.deleteOne({ _id: user._id });

    const res = await request(app)
      .post(BASE_URL)
      .send({ token, password: "NouveauMotDePasse456!" });

    expect(res.status).toBe(404);
  });
});
