import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import GameServer from "../../../src/models/GameServer.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";

const BASE_URL = "/admin/game-servers";

function adminToken() {
  return generateAccessToken({ userId: "64f1a2b3c4d5e6f7a8b9c0d1", role: "admin" });
}

function userToken() {
  return generateAccessToken({ userId: "64f1a2b3c4d5e6f7a8b9c0d2", role: "user" });
}

const payload = {
  name: "Minecraft",
  gameData: {
    slug: "minecraft",
    type: "minecraft" as const,
    containerName: "minecraft-server",
  },
};

describe("Routes /admin/game-servers", () => {
  describe("Accès", () => {
    it("Renvoie 404 sans authentification", async () => {
      const res = await request(app).get(BASE_URL);
      expect(res.status).toBe(404);
    });

    it("Renvoie 404 pour un utilisateur authentifié non-admin", async () => {
      const res = await request(app)
        .get(BASE_URL)
        .set("Cookie", `accessToken=${userToken()}`);
      expect(res.status).toBe(404);
    });

    it("Autorise un utilisateur admin", async () => {
      const res = await request(app)
        .get(BASE_URL)
        .set("Cookie", `accessToken=${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /admin/game-servers", () => {
    it("Liste tous les serveurs", async () => {
      await GameServer.create(payload);
      const res = await request(app)
        .get(BASE_URL)
        .set("Cookie", `accessToken=${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.servers).toHaveLength(1);
      expect(res.body.servers[0].name).toBe("Minecraft");
    });
  });

  describe("POST /admin/game-servers", () => {
    it("Crée un nouveau serveur", async () => {
      const res = await request(app)
        .post(BASE_URL)
        .set("Cookie", `accessToken=${adminToken()}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.server.name).toBe("Minecraft");

      const inDb = await GameServer.findOne({ name: "Minecraft" });
      expect(inDb).not.toBeNull();
    });

    it("Refuse un nom manquant", async () => {
      const res = await request(app)
        .post(BASE_URL)
        .set("Cookie", `accessToken=${adminToken()}`)
        .send({ gameData: payload.gameData });

      expect(res.status).toBe(400);
    });

    it("Refuse un slug déjà utilisé", async () => {
      await GameServer.create(payload);
      const res = await request(app)
        .post(BASE_URL)
        .set("Cookie", `accessToken=${adminToken()}`)
        .send({ ...payload, name: "Minecraft Hard" });

      expect(res.status).toBe(409);
    });
  });

  describe("PATCH /admin/game-servers/:id", () => {
    it("Met à jour un serveur existant", async () => {
      const server = await GameServer.create(payload);
      const res = await request(app)
        .patch(`${BASE_URL}/${server._id}`)
        .set("Cookie", `accessToken=${adminToken()}`)
        .send({ connectionInfo: { address: "1.2.3.4", port: 25565 } });

      expect(res.status).toBe(200);
      expect(res.body.server.connectionInfo.address).toBe("1.2.3.4");

      const inDb = await GameServer.findById(server._id);
      expect(inDb?.connectionInfo.port).toBe(25565);
    });

    it("Renvoie 404 pour un serveur inexistant", async () => {
      const res = await request(app)
        .patch(`${BASE_URL}/64f1a2b3c4d5e6f7a8b9c0d1`)
        .set("Cookie", `accessToken=${adminToken()}`)
        .send({ name: "Autre" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /admin/game-servers/:id", () => {
    it("Supprime un serveur existant", async () => {
      const server = await GameServer.create(payload);
      const res = await request(app)
        .delete(`${BASE_URL}/${server._id}`)
        .set("Cookie", `accessToken=${adminToken()}`);

      expect(res.status).toBe(204);

      const inDb = await GameServer.findById(server._id);
      expect(inDb).toBeNull();
    });

    it("Renvoie 404 pour un serveur inexistant", async () => {
      const res = await request(app)
        .delete(`${BASE_URL}/64f1a2b3c4d5e6f7a8b9c0d1`)
        .set("Cookie", `accessToken=${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });
});
