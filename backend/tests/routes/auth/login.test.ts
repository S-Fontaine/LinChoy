import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
const BASE_URL = "/api/auth/login";

describe("Test route: POST /api/auth/login", () => {
  const jwtRegex =
    /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/;
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "adminLinchoyTest!",
    isVerified: true,
  };

  it("Authentifie un utilisateur avec des données valides", async () => {
    await User.create(payload);

    const res = await request(app)
      .post(BASE_URL)
      .send({ email: payload.email, password: payload.password });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(typeof res.body.accessToken).toBe("string");
    expect(res.body.accessToken.length).toBeGreaterThan(20);
    expect(res.body.accessToken).toMatch(jwtRegex);
    expect(typeof res.body.refreshToken).toBe("string");
    expect(res.body.refreshToken.length).toBeGreaterThan(20);
    expect(res.body.refreshToken).toMatch(jwtRegex);
  });

  it("Refuse un email invalide", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: "pas-un-email",
      password: payload.password,
    });
    expect(res.status).toBe(401);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Identifiants invalides");
  });

  it("Refuse un mot de passe invalide", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: payload.email,
      password: "mauvaisMotDePasse",
    });

    expect(res.status).toBe(401);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Identifiants invalides");
  });

  it("Refuse un utilisateur non vérifié", async () => {
    await User.create({ ...payload, isVerified: false });
    const res = await request(app).post(BASE_URL).send({
      email: payload.email,
      password: payload.password,
    });
    expect(res.status).toBe(403);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toContain("Veuillez vérifier votre email");
  });

  it("Refuse un utilisateur inexistant", async () => {});
  it("Resfuse un email absent", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: "",
      password: payload.password,
    });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Champs requis");
  });
  it("Resfuse un email undefined", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: undefined,
      password: payload.password,
    });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Champs requis");
  });
  it("Resfuse un password absent", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: payload.email,
      password: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Champs requis");
  });
  it("Resfuse un password undefined", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: payload.email,
      password: undefined,
    });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Champs requis");
  });
  it("Resfuse un password et un email absent", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: "",
      password: "",
    });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Champs requis");
  });
  it("Resfuse un password et un email undefined", async () => {
    await User.create(payload);
    const res = await request(app).post(BASE_URL).send({
      email: undefined,
      password: undefined,
    });
    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Champs requis");
  });
});
