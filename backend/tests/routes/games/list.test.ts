import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import GameServer, {
  type IGameServer,
} from "../../../src/models/GameServer.js";
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
      gameData: {
        slug: "minecraft",
        type: "minecraft",
        containerName: "minecraft-server",
      },
    });
    await GameServer.create({
      name: "Valheim",
      gameData: {
        slug: "valheim",
        type: "protocol-valve",
        containerName: "valheim-server",
      },
      statusInfo: { comingSoon: true },
    });

    const res = await request(app).get(BASE_URL);

    expect(res.status).toBe(200);
    expect(res.body.servers).toHaveLength(2);
    const minecraft = res.body.servers.find(
      (s: IGameServer) => s.gameData.slug === "minecraft",
    );
    expect(minecraft.name).toBe("Minecraft");
    expect(minecraft.statusInfo).toBeDefined();
    expect(minecraft.statusInfo.comingSoon).toBe(false);
  });

  it("Ne nécessite pas d'authentification", async () => {
    const res = await request(app).get(BASE_URL);
    expect(res.status).not.toBe(401);
  });
});
