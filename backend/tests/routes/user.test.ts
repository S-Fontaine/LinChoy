import { describe, it, expect, beforeAll, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";
import User from "../../src/models/User.js"

describe("POST /users", () => {
  it("crée un utilisateur avec des données valides", async () => {
    const res = await request(app).post("/users").send({
      username: "linchoyTest",
      email: "test@linchoy.com",
      password: ""
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.email).toBe("seb@test.fr");
    expect(res.body.password).toBeUndefined(); // ⚠️ le password ne doit JAMAIS revenir dans la réponse
  });

  it("refuse un email invalide", async () => {
    const res = await request(app).post("/users").send({
      username: "seb",
      email: "pas-un-email",
      password: "motdepasse123"
    });

    expect(res.status).toBe(400);
  });

  it("refuse un password absent", async () => {
    const res = await request(app).post("/users").send({
      username: "seb",
      email: "seb@test.fr"
    });

    expect(res.status).toBe(400);
  });

  it("refuse un email déjà utilisé", async () => {
    await User.create({
      username: "premier",
      email: "seb@test.fr",
      password: "motdepasse123"
    });

    const res = await request(app).post("/users").send({
      username: "second",
      email: "seb@test.fr", // même email
      password: "autremdp456"
    });

    expect(res.status).toBe(409); // 409 Conflict = plus précis que 400 pour un doublon
  });
});