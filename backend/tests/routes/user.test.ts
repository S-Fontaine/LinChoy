import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";
import User from "../../src/models/User.js";

describe("POST /users/signup", () => {
  const payload = {
    username: "linchoyTest",
    email: "contact@linchoy.com",
    password: "adminLinchoyTest!",
  };
  it("Crée un utilisateur avec des données valides", async () => {
    const res = await request(app).post("/users/signup").send({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(201);
    expect(res.body.result).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.username).toBe(payload.username);
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it("Refuse un email invalide", async () => {
    const res = await request(app).post("/users/signup").send({
      username: payload.username,
      email: "pas-un-email",
      password: payload.password,
    });

    expect(res.status).toBe(400);
  });

  it("Refuse un email déjà utilisé", async () => {
    await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    const res = await request(app).post("/users/signup").send({
      username: "linchoyTest2",
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(409);
  });

  it("Refuse un password absent", async () => {
    const res = await request(app).post("/users/signup").send({
      username: payload.username,
      email: payload.email,
    });

    expect(res.status).toBe(400);
  });

  it("Refuse un username déjà utilisé", async () => {
    await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    const res = await request(app).post("/users/signup").send({
      username: payload.username,
      email: "contact2@linchoy.com",
      password: payload.password,
    });

    expect(res.status).toBe(409);
  });

  it("Refuse un username trop long", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "linChoyAdminTestUsernameLength",
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(400);
  });

  it("Refuse un username trop court", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "li",
      email: payload.email,
      password: payload.password,
    });

    expect(res.status).toBe(400);
  });

  it("Renvoie toutes les erreurs si plusieurs champs sont invalides", async () => {
    const res = await request(app).post("/users/signup").send({
      username: "T",
      email: "e",
      password: "st",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Le nom d'utilisateur");
    expect(res.body.message).toContain("Email invalide");
    expect(res.body.message).toContain("12 caractères");
  });
});
