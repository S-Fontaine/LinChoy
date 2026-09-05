import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

describe("Test route: GET /steam/link", () => {
  it("Redirige vers Steam avec les bons paramètres", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .get("/steam/link")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("steamcommunity.com/openid/login");
  });

  it("Refuse la requête sans authentification", async () => {
    const res = await request(app).get("/steam/link");
    expect(res.status).toBe(401);
  });
});