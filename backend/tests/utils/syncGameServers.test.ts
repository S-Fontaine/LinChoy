import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const findMock = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const updateOneMock = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.unstable_mockModule("../../src/models/GameServer.js", () => ({
  default: { find: findMock, updateOne: updateOneMock },
}));

const syncGameServerDataMock =
  jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.unstable_mockModule("../../src/utils/gameServers/getPalworldData.js", () => ({
  syncGameServerData: syncGameServerDataMock,
}));

const getContainerStateMock =
  jest.fn<(...args: unknown[]) => Promise<{ running: boolean }>>();
jest.unstable_mockModule("../../src/utils/gameServers/docker.js", () => ({
  getContainerState: getContainerStateMock,
  isServerOnline: jest.fn<(...args: unknown[]) => Promise<boolean>>(),
}));

const getSourceQueryStatusMock =
  jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.unstable_mockModule("../../src/utils/gameServers/gameStatusProviders.js", () => ({
  getSourceQueryStatus: getSourceQueryStatusMock,
}));

const { syncGameServers } = await import("../../src/utils/gameServers/syncGameServers.js");

function makeServer(overrides: Record<string, unknown> = {}) {
  const base = {
    _id: "id1",
    name: "Minecraft",
    type: "minecraft",
    containerName: "minecraft-server",
    address: "127.0.0.1",
    port: 25565,
    queryPort: 25566,
    status: { state: "offline", online: false, playerCount: 0 },
    ...overrides,
  };

  return {
    ...base,
    toObject: () => base,
  };
}

describe("Test utilitaire: syncGameServers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateOneMock.mockResolvedValue(undefined);
  });

  it("Délègue les serveurs Palworld à syncGameServerData", async () => {
    findMock.mockResolvedValue([makeServer({ type: "palworld" })]);

    await syncGameServers();

    expect(syncGameServerDataMock).toHaveBeenCalledTimes(1);
    expect(getContainerStateMock).not.toHaveBeenCalled();
  });

  it("Ignore un serveur sans address/port", async () => {
    findMock.mockResolvedValue([makeServer({ address: undefined })]);

    await syncGameServers();

    expect(getContainerStateMock).not.toHaveBeenCalled();
    expect(updateOneMock).not.toHaveBeenCalled();
  });

  it("Passe le serveur en offline si le container n'est pas actif", async () => {
    findMock.mockResolvedValue([makeServer()]);
    getContainerStateMock.mockResolvedValue({ running: false });

    await syncGameServers();

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "id1" },
      expect.objectContaining({
        $set: expect.objectContaining({
          "status.state": "offline",
          "status.online": false,
          "status.playerCount": 0,
        }),
      }),
    );
    expect(getSourceQueryStatusMock).not.toHaveBeenCalled();
  });

  it("Passe le serveur en offline si le container est introuvable (erreur dockerode)", async () => {
    findMock.mockResolvedValue([makeServer()]);
    getContainerStateMock.mockRejectedValue(new Error("no such container"));

    await syncGameServers();

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "id1" },
      expect.objectContaining({
        $set: expect.objectContaining({ "status.state": "offline" }),
      }),
    );
  });

  it("Passe en ligne si le container tourne et que le jeu répond", async () => {
    findMock.mockResolvedValue([makeServer()]);
    getContainerStateMock.mockResolvedValue({ running: true });
    getSourceQueryStatusMock.mockResolvedValue({
      online: true,
      playerCount: 5,
      maxPlayers: 20,
      version: "1.20",
      players: ["Alice"],
      displayName: "Mon serveur",
    });

    await syncGameServers();

    expect(getSourceQueryStatusMock).toHaveBeenCalledWith(
      "127.0.0.1",
      25566,
      "minecraft",
    );
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "id1" },
      expect.objectContaining({
        $set: expect.objectContaining({
          "status.state": "online",
          "status.online": true,
          "status.playerCount": 5,
        }),
      }),
    );
  });

  it("Passe en 'starting' si le container est actif mais que le jeu ne répond pas encore", async () => {
    findMock.mockResolvedValue([makeServer()]);
    getContainerStateMock.mockResolvedValue({ running: true });
    getSourceQueryStatusMock.mockResolvedValue({
      online: false,
      playerCount: 0,
    });

    await syncGameServers();

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: "id1" },
      expect.objectContaining({
        $set: expect.objectContaining({
          "status.state": "starting",
          "status.online": false,
        }),
      }),
    );
  });

  it("Traite chaque serveur indépendamment", async () => {
    findMock.mockResolvedValue([
      makeServer({ _id: "id1", name: "Minecraft" }),
      makeServer({ _id: "id2", name: "V Rising" }),
    ]);
    getContainerStateMock.mockResolvedValue({ running: false });

    await syncGameServers();

    expect(updateOneMock).toHaveBeenCalledTimes(2);
  });
});
