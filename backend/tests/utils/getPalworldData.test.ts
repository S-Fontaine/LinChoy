import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import GameServer from "../../src/models/GameServer.js";

const getContainerStateMock = jest.fn<() => Promise<{ running: boolean }>>();

jest.unstable_mockModule("../../src/utils/gameServers/docker.js", () => ({
  getContainerState: getContainerStateMock,
  isServerOnline: jest.fn<() => Promise<boolean>>(),
}));

const { syncGameServerData } =
  await import("../../src/utils/gameServers/getPalworldData.js");

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as unknown as Response;
}

describe("Test utilitaire: syncGameServerData (Palworld)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  it("Passe le serveur en offline si le container Palworld n'est pas actif", async () => {
    await GameServer.create({
      name: "Palworld",
      slug: "palworld",
      type: "palworld",
      containerName: "palworld-server",
      status: { state: "online", online: true, playerCount: 3 },
    });
    getContainerStateMock.mockResolvedValue({ running: false });

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.status.state).toBe("offline");
    expect(updated?.status.online).toBe(false);
    expect(updated?.status.playerCount).toBe(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Marque le serveur en ligne si l'API répond correctement", async () => {
    await GameServer.create({
      name: "Palworld",
      slug: "palworld",
      type: "palworld",
      containerName: "palworld-server",
    });
    getContainerStateMock.mockResolvedValue({ running: true });

    const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockedFetch
      .mockResolvedValueOnce(
        jsonResponse({ servername: "Mon Pal", description: "desc" }),
      )
      .mockResolvedValueOnce(jsonResponse({ players: [{ name: "Alice" }] }))
      .mockResolvedValueOnce(
        jsonResponse({ currentplayernum: 1, maxplayernum: 32 }),
      )
      .mockResolvedValueOnce(jsonResponse({}));

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.status.state).toBe("online");
    expect(updated?.status.online).toBe(true);
    expect(updated?.status.playerCount).toBe(1);
    expect(updated?.status.maxPlayers).toBe(32);
    expect(updated?.status.displayName).toBe("Mon Pal");
    expect(updated?.status.players).toEqual(["Alice"]);
  });

  it("Passe en 'starting' si le container tourne mais que l'API répond en erreur", async () => {
    await GameServer.create({
      name: "Palworld",
      slug: "palworld",
      type: "palworld",
      containerName: "palworld-server",
    });
    getContainerStateMock.mockResolvedValue({ running: true });

    const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockedFetch.mockResolvedValue(jsonResponse({}, false));

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.status.state).toBe("starting");
    expect(updated?.status.online).toBe(false);
    expect(updated?.status.playerCount).toBe(0);
  });

  it("Passe le statut à offline si une exception réseau survient", async () => {
    await GameServer.create({
      name: "Palworld",
      slug: "palworld",
      type: "palworld",
      containerName: "palworld-server",
      status: { online: true, state: "online" },
    });
    getContainerStateMock.mockResolvedValue({ running: true });

    const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockedFetch.mockRejectedValue(new Error("network down"));

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.status.online).toBe(false);
  });
  it("Ne crée rien et avertit si le document Palworld n'existe pas encore (pas de seed)", async () => {
    getContainerStateMock.mockResolvedValue({ running: true });
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    await syncGameServerData();

    const doc = await GameServer.findOne({ name: "Palworld" });
    expect(doc).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[sync] Document 'Palworld' introuvable"),
    );
  });
});
