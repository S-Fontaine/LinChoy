import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import {
  generateRefreshToken,
  generateAccessToken,
} from "../../../src/utils/auth/jwt.js";
const BASE_URL = "/auth/refresh";

describe("POST /auth/refresh", () => {
  it("Renvoie un nouvel accessToken avec un refreshToken valide", async () => {
    const refreshToken = generateRefreshToken({ userId: "abc123" });

    const res = await request(app)
      .post(BASE_URL)
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
  });

  it("Place le nouvel accessToken dans un cookie httpOnly", async () => {
    const refreshToken = generateRefreshToken({ userId: "abc123" });

    const res = await request(app)
      .post(BASE_URL)
      .set("Cookie", `refreshToken=${refreshToken}`);

    const cookies = [res.headers["set-cookie"]].flat();
    const accessCookie = cookies.find((c) => c?.startsWith("accessToken="));

    expect(accessCookie).toBeDefined();
    expect(accessCookie).toContain("HttpOnly");
  });

  it("Refuse une requête sans refreshToken", async () => {
    const res = await request(app).post(BASE_URL);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Refresh token manquant");
  });

  it("Refuse un refreshToken invalide", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Cookie", "refreshToken=token.invalide.bidon");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Refresh token invalide ou expiré");
  });

  it("Refuse un refreshToken expiré", async () => {
    const expiredRefreshToken = generateRefreshToken(
      { userId: "abc123" },
      { expiresIn: "-1s" },
    );

    const res = await request(app)
      .post(BASE_URL)
      .set("Cookie", `refreshToken=${expiredRefreshToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Refresh token invalide ou expiré");
  });

  it("Refuse un accessToken utilisé à la place d'un refreshToken", async () => {
    const accessToken = generateAccessToken({ userId: "abc123" });

    const res = await request(app)
      .post(BASE_URL)
      .set("Cookie", `refreshToken=${accessToken}`);

    expect(res.status).toBe(401);
  });
});