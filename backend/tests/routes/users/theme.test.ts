import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import User from "../../../src/models/User.js";
import app from "../../../src/app.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";
const BASE_URL = "/users";

describe("Test route: PATCH /users/:id/theme", () => {
  const userPayload = {
    username: "linchoyTest",
    email: "fake@linchoy.com",
    password: "MotDePasse123!",
  };

  it("Passe le thème en 'light'", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/theme`)
      .set("Cookie", `accessToken=${token}`)
      .send({ theme: "light" });

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("light");

    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.theme).toBe("light");
  });

  it("Refuse une valeur de thème invalide", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/theme`)
      .set("Cookie", `accessToken=${token}`)
      .send({ theme: "purple" });

    expect(res.status).toBe(400);

    const untouchedUser = await User.findById(user._id);
    expect(untouchedUser?.theme).toBe("dark");
  });

  it("Refuse la requête sans authentification", async () => {
    const user = await User.create(userPayload);

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/theme`)
      .send({ theme: "light" });

    expect(res.status).toBe(401);
  });

  it("Refuse qu'un utilisateur modifie le thème d'un autre compte", async () => {
    const user = await User.create(userPayload);
    const otherUser = await User.create({
      username: "autreUser",
      email: "autre@linchoy.com",
      password: "MotDePasse123!",
    });
    const token = generateAccessToken({ userId: otherUser._id.toString() });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/theme`)
      .set("Cookie", `accessToken=${token}`)
      .send({ theme: "light" });

    expect(res.status).toBe(403);
  });

  it("Renvoie 404 si l'utilisateur cible n'existe plus", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    await User.deleteOne({ _id: user._id });

    const res = await request(app)
      .patch(`${BASE_URL}/${user._id}/theme`)
      .set("Cookie", `accessToken=${token}`)
      .send({ theme: "light" });

    expect(res.status).toBe(404);
  });
});
