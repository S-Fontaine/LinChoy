import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import GameServer from "../../../src/models/GameServer.js";
const BASE_URL = "/games";

describe("Test route: GET /games/:slug", () => {
  it("Renvoie les détails d'un serveur existant", async () => {
    await GameServer.create({
      name: "Minecraft",
      slug: "minecraft",
      type: "minecraft",
      containerName: "minecraft-server",
      status: {
        state: "online",
        online: true,
        playerCount: 3,
        maxPlayers: 20,
        players: ["Alice", "Bob", "Charlie"],
        displayName: "Serveur Survie",
        description: "Un monde en survie",
      },
    });

    const res = await request(app).get(`${BASE_URL}/minecraft`);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.data).toMatchObject({
      name: "Minecraft",
      servername: "Serveur Survie",
      description: "Un monde en survie",
      totalPlayer: 20,
      playerOnLine: 3,
      players: ["Alice", "Bob", "Charlie"],
      state: "online",
      online: true,
      comingSoon: false,
    });
  });

  it("Utilise le nom du serveur si displayName est absent", async () => {
    await GameServer.create({
      name: "Valheim",
      slug: "valheim",
      type: "protocol-valve",
      containerName: "valheim-server",
    });

    const res = await request(app).get(`${BASE_URL}/valheim`);

    expect(res.body.data.servername).toBe("Valheim");
    expect(res.body.data.description).toBe("");
  });

  it("Renvoie une liste de joueurs vide par défaut", async () => {
    await GameServer.create({
      name: "Valheim",
      slug: "valheim",
      type: "protocol-valve",
      containerName: "valheim-server",
    });

    const res = await request(app).get(`${BASE_URL}/valheim`);

    expect(res.body.data.players).toEqual([]);
  });

  it("Renvoie 404 pour un slug inexistant", async () => {
    const res = await request(app).get(`${BASE_URL}/inexistant`);

    expect(res.status).toBe(404);
    expect(res.body.result).toBe(false);
  });

  it("Ne nécessite pas d'authentification", async () => {
    await GameServer.create({
      name: "Minecraft",
      slug: "minecraft",
      type: "minecraft",
      containerName: "minecraft-server",
    });

    const res = await request(app).get(`${BASE_URL}/minecraft`);
    expect(res.status).not.toBe(401);
  });
});