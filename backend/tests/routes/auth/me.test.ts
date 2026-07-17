import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import { generateAccessToken } from "../../../src/utils/jwt.js";
const BASE_URL = "/auth/me";

describe("GET /auth/me", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "adminLinchoyTest!",
    isVerified: true,
  };

  it("Renvoie les infos de l'utilisateur connecté", async () => {
    const user = await User.create(payload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .get(BASE_URL)
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.user.id).toBe(user._id.toString());
    expect(res.body.user.username).toBe(payload.username);
    expect(res.body.user.email).toBe(payload.email);
  });

  it("Ne renvoie jamais le password", async () => {
    const user = await User.create(payload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .get(BASE_URL)
      .set("Cookie", `accessToken=${token}`);

    expect(res.body.user.password).toBeUndefined();
  });

  it("Renvoie 401 si aucun cookie n'est envoyé", async () => {
    const res = await request(app).get(BASE_URL);

    expect(res.status).toBe(401);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toContain("Token manquant");
  });

  it("Renvoie 401 si le token est invalide", async () => {
    const res = await request(app)
      .get(BASE_URL)
      .set("Cookie", "accessToken=token.invalide");

    expect(res.status).toBe(401);
  });

  it("Renvoie 401 si le token est expiré", async () => {
    const user = await User.create(payload);
    const expiredToken = generateAccessToken(
      { userId: user._id.toString() },
      { expiresIn: "-1s" },
    );

    const res = await request(app)
      .get(BASE_URL)
      .set("Cookie", `accessToken=${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it("Renvoie 404 si l'utilisateur du token n'existe plus", async () => {
    const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";
    const token = generateAccessToken({ userId: fakeId });

    const res = await request(app)
      .get(BASE_URL)
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Utilisateur introuvable");
  });
});
