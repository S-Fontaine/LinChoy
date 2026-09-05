import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const queryMock = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.unstable_mockModule("gamedig", () => ({
  GameDig: { query: queryMock },
}));

const { getSourceQueryStatus } = await import(
  "../../src/utils/gameServers/gameStatusProviders.js"
);

describe("Test utilitaire: getSourceQueryStatus", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it("Renvoie le statut en ligne avec les données du serveur si la requête réussit", async () => {
    queryMock.mockResolvedValue({
      name: "Mon serveur",
      maxplayers: 20,
      version: "1.2.3",
      players: [{ name: "Alice" }, { name: "Bob" }],
    });

    const result = await getSourceQueryStatus("127.0.0.1", 25566, "minecraft");

    expect(result).toEqual({
      online: true,
      playerCount: 2,
      maxPlayers: 20,
      version: "1.2.3",
      players: ["Alice", "Bob"],
      displayName: "Mon serveur",
    });
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "minecraft",
        host: "127.0.0.1",
        port: 25566,
      }),
    );
  });

  it("Renvoie offline sans lever d'exception si le serveur ne répond pas", async () => {
    queryMock.mockRejectedValue(new Error("timeout"));

    const result = await getSourceQueryStatus("127.0.0.1", 25566, "minecraft");

    expect(result).toEqual({ online: false, playerCount: 0 });
  });

  it("Renvoie 0 joueur si la liste des joueurs est vide", async () => {
    queryMock.mockResolvedValue({
      name: "Serveur vide",
      maxplayers: 10,
      version: "1.0",
      players: [],
    });

    const result = await getSourceQueryStatus("127.0.0.1", 25566, "vrising");

    expect(result.online).toBe(true);
    expect(result.playerCount).toBe(0);
  });
});