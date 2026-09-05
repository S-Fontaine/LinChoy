import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";
const BASE_URL = "/users";

describe("DELETE /users/:id", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
  };

  it("Supprime son propre compte avec le bon mot de passe", async () => {
    const user = await User.create(payload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .delete(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ password: payload.password });

    expect(res.status).toBe(204);

    const check = await User.findById(user._id);
    expect(check).toBeNull();
  });

  it("Refuse la suppression sans mot de passe fourni", async () => {
    const user = await User.create(payload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .delete(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("Refuse la suppression avec un mauvais mot de passe", async () => {
    const user = await User.create(payload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .delete(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ password: "MauvaisMotDePasse" });

    expect(res.status).toBe(401);

    const check = await User.findById(user._id);
    expect(check).not.toBeNull();
  });

  it("Refuse la suppression du compte d'un autre utilisateur", async () => {
    const user = await User.create(payload);
    const otherUser = await User.create({
      username: "autre",
      email: "autre@test.fr",
      password: "AutreMotDePasse123!",
    });
    const token = generateAccessToken({ userId: otherUser._id.toString() });

    const res = await request(app)
      .delete(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ password: payload.password });

    expect(res.status).toBe(403);

    const check = await User.findById(user._id);
    expect(check).not.toBeNull();
  });

  it("Refuse une requête sans token d'authentification", async () => {
    const user = await User.create(payload);

    const res = await request(app)
      .delete(`${BASE_URL}/${user._id}`)
      .send({ password: payload.password });

    expect(res.status).toBe(401);
  });

  it("Renvoie 404 si l'utilisateur n'existe déjà plus", async () => {
    const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";
    const token = generateAccessToken({ userId: fakeId });

    const res = await request(app)
      .delete(`${BASE_URL}/${fakeId}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ password: payload.password });

    expect(res.status).toBe(404);
  });
});
