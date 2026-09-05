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

describe("Test route: DELETE /steam/link", () => {
  it("Délie le compte Steam", async () => {
    const user = await User.create({ ...userPayload, steamId: "76561198000000000" });
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .delete("/steam/link")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);

    const updated = await User.findById(user._id);
    expect(updated?.steamId).toBeNull();
  });

  it("Refuse la requête sans authentification", async () => {
    const res = await request(app).delete("/steam/link");
    expect(res.status).toBe(401);
  });
});