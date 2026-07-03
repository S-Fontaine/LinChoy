import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import { generateVerifyToken } from "../../../src/utils/jwt.js";

describe("GET /auth/email/verify", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
  };

  it("Vérifie un compte avec un token valide", async () => {
    const user = await User.create(payload);
    expect(user.isVerified).toBe(false);

    const token = generateVerifyToken({ userId: user._id.toString() });
    const res = await request(app).get(`/auth/email/verify?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.isVerified).toBe(true);
  });

  it("Refuse une requête sans token", async () => {
    const res = await request(app).get("/auth/email/verify");

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
  });

  it("Refuse un token invalide", async () => {
    const res = await request(app).get("/auth/email/verify?token=token.invalide.faux");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalide|expiré/i);
  });

  it("Refuse un token expiré", async () => {

    const user = await User.create(payload);
    const expiredToken = generateVerifyToken(
      { userId: user._id.toString() },
      { expiresIn: "-1s" }
    );

    const res = await request(app).get(`/auth/email/verify?token=${expiredToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalide|expiré/i);
  });

  it("Renvoie 404 si l'utilisateur a été supprimé entre-temps", async () => {
    const user = await User.create(payload);
    const token = generateVerifyToken({ userId: user._id.toString() });

    await User.deleteOne({ _id: user._id });

    const res = await request(app).get(`/auth/email/verify?token=${token}`);

    expect(res.status).toBe(404);
  });

  it("Reste inchangé si le compte est déjà vérifié", async () => {
    const user = await User.create({ ...payload, isVerified: true });
    const token = generateVerifyToken({ userId: user._id.toString() });

    const res = await request(app).get(`/auth/email/verify?token=${token}`);

    expect(res.status).toBe(200);
  });
});