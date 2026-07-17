import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
const BASE_URL = "/auth/login";

describe("Test route: POST /auth/login", () => {
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
    const cookies = [res.headers["set-cookie"]].flat();
    const accessCookie = cookies.find((c) => c?.startsWith("accessToken="));
    const refreshCookie = cookies.find((c) => c?.startsWith("refreshToken="));

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(cookies).toBeDefined();
    expect(accessCookie).toBeDefined();
    expect(accessCookie).toContain("HttpOnly");
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain("HttpOnly");
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

  it("Refuse un utilisateur inexistant", async () => {
    const res = await request(app).post(BASE_URL).send(payload);

    expect(res.status).toBe(401);
    expect(res.body.result).toBe(false);
    expect(res.body.message).toBe("Identifiants invalides");
  });
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
  it("Renvoie les infos user dans la réponse de login", async () => {
    await User.create({ ...payload, isVerified: true });

    const res = await request(app).post(BASE_URL).send(payload);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBeDefined();
    expect(res.body.user.email).toBe(payload.email);
    expect(res.body.user.password).toBeUndefined();
  });
});
