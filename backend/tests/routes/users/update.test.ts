import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import User from "../../../src/models/User.js";
import app from "../../../src/app.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";
const BASE_URL = "/users";

describe("Test route: PATCH /users/:id", () => {
  const payload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
  };

  it("Met à jour uniquement le champ envoyé", async () => {
    const user = await User.create(payload);

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ username: "linchoy" });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data.username).toBe("linchoy");
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.message).toBe("Utilisateur mis à jour avec succès.");
  });

  it("Met à jour plusieurs champs à la fois", async () => {
    const user = await User.create(payload);

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ username: "linchoy", email: "fake2@linchoy.com" });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data.username).toBe("linchoy");
    expect(res.body.data.email).toBe("fake2@linchoy.com");
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.message).toBe("Utilisateur mis à jour. Vérifiez votre nouvel email pour le confirmer.");
  });

  it("Modifie isVerified à false si l'email change", async () => {
    const user = await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      isVerified: true,
    });

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ email: "fake2@linchoy.com" });

    expect(res.status).toBe(200);
    expect(res.body.data.isVerified).toBe(false);
  });

  it("Refuse la modification de isVerified si l'email ne change pas", async () => {
    const user = await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      isVerified: true,
    });

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ username: "linchoy" });

    expect(res.status).toBe(200);
    expect(res.body.data.isVerified).toBe(true);
  });

  it("Refuse la mise à jour si l'email envoyé est identique à l'actuel", async () => {
    const user = await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      isVerified: true,
    });

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ email: payload.email });

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
  });

  it("Refuse la mise à jour si le username envoyé est identique à l'actuel", async () => {
    const user = await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ username: payload.username });

    expect(res.status).toBe(400);
    expect(res.body.result).toBe(false);
  });

  it("Applique le changement d'email même si le username est identique", async () => {
    const user = await User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      isVerified: true,
    });

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ username: payload.username, email: "fake2@linchoy.com" });

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe(payload.username);
    expect(res.body.data.email).toBe("fake2@linchoy.com");
    expect(res.body.message).toBe("Utilisateur mis à jour. Vérifiez votre nouvel email pour le confirmer.");
    expect(res.body.data.isVerified).toBe(false);
  });

  it("Refuse la requête si aucun champ ne représente un vrai changement", async () => {
    const user = await User.create(payload);

    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ username: payload.username, email: payload.email });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Aucune modification détectée");
  });

  it("Accepte la requête si seul le password est fourni, même sans changement d'username/email", async () => {
    const user = await User.create(payload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}`)
      .set("Cookie", `accessToken=${token}`)
      .send({ password: "NouveauMotDePasse456!" });

    expect(res.status).toBe(200);
  });
});
