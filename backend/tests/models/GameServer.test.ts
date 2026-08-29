import { describe, it, expect } from "@jest/globals";
import GameServer from "../../src/models/GameServer.js";

describe("Test modèle: GameServer", () => {
  const validPayload = {
    name: "Minecraft",
    slug: "minecraft",
    type: "minecraft" as const,
    containerName: "minecraft-server",
  };

  it("Crée un document valide avec les valeurs par défaut attendues", async () => {
    const server = await GameServer.create(validPayload);

    expect(server.status.state).toBe("offline");
    expect(server.status.online).toBe(false);
    expect(server.status.playerCount).toBe(0);
    expect(server.comingSoon).toBe(false);
    expect(server.image).toBe("");
  });

  it("Refuse un type hors de l'enum autorisé", async () => {
    await expect(
      GameServer.create({
        ...validPayload,
        type: "fortnite",
      } as unknown as Parameters<typeof GameServer.create>[0]),
    ).rejects.toThrow();
  });

  it("Refuse un status.state hors de l'enum autorisé", async () => {
    await expect(
      GameServer.create({
        ...validPayload,
        status: { state: "en-panne" },
      } as unknown as Parameters<typeof GameServer.create>[0]),
    ).rejects.toThrow();
  });

  it("Refuse deux serveurs avec le même name (unique)", async () => {
    await GameServer.create(validPayload);

    await expect(
      GameServer.create({ ...validPayload, slug: "minecraft-2" }),
    ).rejects.toThrow();
  });

  it("Refuse deux serveurs avec le même slug (unique)", async () => {
    await GameServer.create(validPayload);

    await expect(
      GameServer.create({
        ...validPayload,
        name: "Minecraft Bis",
      }),
    ).rejects.toThrow();
  });

  it("Exige name, slug, type et containerName", async () => {
    await expect(GameServer.create({})).rejects.toThrow();
  });

  it("Accepte un document sans palworldData (optionnel)", async () => {
    const server = await GameServer.create(validPayload);
    expect(server.palworldData).toBeUndefined();
  });
});
