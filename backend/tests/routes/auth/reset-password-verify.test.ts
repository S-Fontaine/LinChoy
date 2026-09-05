import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import {
  generateResetToken,
  computePasswordFingerprint,
} from "../../../src/utils/auth/jwt.js";
const BASE_URL = "/auth/reset-password/verify";

describe("Test route: GET /auth/reset-password/verify", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
    isVerified: true,
  };

  it("Confirme la validité d'un token non utilisé", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    const res = await request(app).get(`${BASE_URL}?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
  });

  it("Refuse un token déjà utilisé (mot de passe changé depuis)", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    user.password = "AutreMotDePasse789!";
    await user.save();

    const res = await request(app).get(`${BASE_URL}?token=${token}`);

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
  });

  it("Ne modifie rien en base (lecture seule)", async () => {
    const user = await User.create(payload);
    const token = generateResetToken({
      userId: user._id.toString(),
      pwdFingerprint: computePasswordFingerprint(user.password),
    });

    await request(app).get(`${BASE_URL}?token=${token}`);

    const untouchedUser = await User.findById(user._id);
    expect(untouchedUser?.password).toBe(user.password);
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

    const res = await request(app).get(`${BASE_URL}?token=${expiredToken}`);

    expect(res.status).toBe(400);
  });

  it("Refuse une requête sans token", async () => {
    const res = await request(app).get(BASE_URL);

    expect(res.status).toBe(400);
  });

  it("Refuse un token invalide", async () => {
    const res = await request(app).get(`${BASE_URL}?token=bidon.faux.token`);

    expect(res.status).toBe(400);
  });
});
