import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import User from "../../../src/models/User.js";
import GameServer from "../../../src/models/GameServer.js";
import app from "../../../src/app.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";
const BASE_URL = "/users";

describe("Test route: PATCH /users/:id/favorite-server", () => {
  const userPayload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
  };
  const serverPayload = {
    name: "Minecraft",
    slug: "minecraft",
    type: "minecraft" as const,
    containerName: "minecraft-server",
  };

  it("Définit un serveur favori valide", async () => {
    const user = await User.create(userPayload);
    await GameServer.create(serverPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/favorite-server`)
      .set("Cookie", `accessToken=${token}`)
      .send({ slug: "minecraft" });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.favoriteServer).toBe("minecraft");

    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.favoriteServer).toBe("minecraft");
  });

  it("Retire le favori si slug est null", async () => {
    const user = await User.create({
      ...userPayload,
      favoriteServer: "minecraft",
    });
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/favorite-server`)
      .set("Cookie", `accessToken=${token}`)
      .send({ slug: null });

    expect(res.status).toBe(200);
    expect(res.body.favoriteServer).toBeNull();
  });

  it("Refuse un slug qui ne correspond à aucun serveur", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/favorite-server`)
      .set("Cookie", `accessToken=${token}`)
      .send({ slug: "serveur-inexistant" });

    expect(res.status).toBe(404);
    expect(res.body.result).toBe(false);

    const untouchedUser = await User.findById(user._id);
    expect(untouchedUser?.favoriteServer).toBeNull();
  });

  it("Refuse la requête sans authentification", async () => {
    const user = await User.create(userPayload);

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/favorite-server`)
      .send({ slug: "minecraft" });

    expect(res.status).toBe(401);
  });

  it("Refuse qu'un utilisateur modifie le favori d'un autre compte", async () => {
    const user = await User.create(userPayload);
    const otherUser = await User.create({
      username: "autreUser",
      email: "autre@linchoy.com",
      password: "MotDePasse123!",
    });
    const token = generateAccessToken({ userId: otherUser._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/favorite-server`)
      .set("Cookie", `accessToken=${token}`)
      .send({ slug: "minecraft" });

    expect(res.status).toBe(403);
  });

  it("Renvoie 404 si l'utilisateur cible n'existe plus", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    await User.deleteOne({ _id: user._id });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/favorite-server`)
      .set("Cookie", `accessToken=${token}`)
      .send({ slug: null });

    expect(res.status).toBe(404);
  });
});
