import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import GameServer from "../../../src/models/GameServer.js";
const BASE_URL = "/games";

describe("Test route: GET /games", () => {
  it("Renvoie la liste vide si aucun serveur n'existe", async () => {
    const res = await request(app).get(BASE_URL);

    expect(res.status).toBe(200);
    expect(res.body.result).toBe(true);
    expect(res.body.servers).toEqual([]);
  });

  it("Renvoie tous les serveurs avec les champs attendus", async () => {
    await GameServer.create({
      name: "Minecraft",
      slug: "minecraft",
      type: "minecraft",
      containerName: "minecraft-server",
    });
    await GameServer.create({
      name: "Valheim",
      slug: "valheim",
      type: "protocol-valve",
      containerName: "valheim-server",
      comingSoon: true,
    });

    const res = await request(app).get(BASE_URL);

    expect(res.status).toBe(200);
    expect(res.body.servers).toHaveLength(2);
    const minecraft = res.body.servers.find((s: { slug: string }) => s.slug === "minecraft");
    expect(minecraft.name).toBe("Minecraft");
    expect(minecraft.status).toBeDefined();
    expect(minecraft.comingSoon).toBe(false);
  });

  it("N'expose pas palworldData dans la liste (champ exclu du select)", async () => {
    await GameServer.create({
      name: "Palworld",
      slug: "palworld",
      type: "palworld",
      containerName: "palworld-server",
      palworldData: { info: { servername: "Test" } },
    });

    const res = await request(app).get(BASE_URL);

    expect(res.body.servers[0].palworldData).toBeUndefined();
  });

  it("Ne nécessite pas d'authentification", async () => {
    const res = await request(app).get(BASE_URL);
    expect(res.status).not.toBe(401);
  });
});