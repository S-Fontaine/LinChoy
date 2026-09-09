import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import GameServer from "../../src/models/GameServer.js";
import User from "../../src/models/User.js";
import ServerWhitelist from "../../src/models/ServerWhitelist.js";

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
      gameData: {
        slug: "palworld",
        type: "palworld",
        containerName: "palworld-server",
      },
      statusInfo: { state: "online", online: true, playerCount: 3 },
    });
    getContainerStateMock.mockResolvedValue({ running: false });

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.statusInfo.state).toBe("offline");
    expect(updated?.statusInfo.online).toBe(false);
    expect(updated?.playerInfo.playerCount).toBe(0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Marque le serveur en ligne si l'API répond correctement", async () => {
    const server = await GameServer.create({
      name: "Palworld",
      gameData: {
        slug: "palworld",
        type: "palworld",
        containerName: "palworld-server",
      },
      playerInfo: { maxPlayers: 32 },
    });
    const user = await User.create({
      username: "alice",
      email: "alice@linchoy.com",
      password: "MotDePasse123!",
      steamId: "76561198000000001",
    });
    await ServerWhitelist.create({ user: user._id, gameServer: server._id });
    getContainerStateMock.mockResolvedValue({ running: true });

    const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockedFetch
      .mockResolvedValueOnce(
        jsonResponse({ servername: "Mon Pal", description: "desc" }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          players: [{ name: "Alice", userId: "steam_76561198000000001" }],
        }),
      );

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.statusInfo.state).toBe("online");
    expect(updated?.statusInfo.online).toBe(true);
    expect(updated?.playerInfo.playerCount).toBe(1);
    expect(updated?.playerInfo.maxPlayers).toBe(32);
    expect(updated?.serverInfo.displayName).toBe("Mon Pal");
    expect(updated?.playerInfo.players[0].name).toEqual("Alice");
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });

  it("Passe en 'starting' si le container tourne mais que l'API répond en erreur", async () => {
    await GameServer.create({
      name: "Palworld",
      gameData: {
        slug: "palworld",
        type: "palworld",
        containerName: "palworld-server",
      },
    });
    getContainerStateMock.mockResolvedValue({ running: true });

    const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockedFetch.mockResolvedValue(jsonResponse({}, false));

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.statusInfo.state).toBe("starting");
    expect(updated?.statusInfo.online).toBe(false);
    expect(updated?.playerInfo.playerCount).toBe(0);
  });

  it("Passe une AbortSignal avec timeout à chaque appel fetch", async () => {
    await GameServer.create({
      name: "Palworld",
      gameData: {
        slug: "palworld",
        type: "palworld",
        containerName: "palworld-server",
      },
    });
    getContainerStateMock.mockResolvedValue({ running: true });

    const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockedFetch.mockResolvedValue(jsonResponse({}));

    await syncGameServerData();

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    for (const call of mockedFetch.mock.calls) {
      const init = call[1] as RequestInit;
      expect(init.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("Passe le statut à offline si une exception réseau survient", async () => {
    await GameServer.create({
      name: "Palworld",
      gameData: {
        slug: "palworld",
        type: "palworld",
        containerName: "palworld-server",
      },
      statusInfo: { online: true, state: "online" },
    });
    getContainerStateMock.mockResolvedValue({ running: true });

    const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockedFetch.mockRejectedValue(new Error("network down"));

    await syncGameServerData();

    const updated = await GameServer.findOne({ name: "Palworld" });
    expect(updated?.statusInfo.online).toBe(false);
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

  describe("Auto-kick des joueurs non whitelistés", () => {
    it("Kick un joueur non whitelisté et laisse un joueur whitelisté tranquille", async () => {
      const server = await GameServer.create({
        name: "Palworld",
        gameData: {
          slug: "palworld",
          type: "palworld",
          containerName: "palworld-server",
        },
      });
      const whitelistedUser = await User.create({
        username: "alice",
        email: "alice@linchoy.com",
        password: "MotDePasse123!",
        steamId: "76561198000000001",
      });
      await ServerWhitelist.create({
        user: whitelistedUser._id,
        gameServer: server._id,
      });
      getContainerStateMock.mockResolvedValue({ running: true });

      const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockedFetch
        .mockResolvedValueOnce(jsonResponse({ servername: "Mon Pal" }))
        .mockResolvedValueOnce(
          jsonResponse({
            players: [
              { name: "Alice", userId: "steam_76561198000000001" },
              { name: "Intrus", userId: "steam_99999999999999999" },
            ],
          }),
        )
        .mockResolvedValueOnce(jsonResponse({}));

      await syncGameServerData();

      expect(mockedFetch).toHaveBeenCalledTimes(3);
      const [kickUrl, kickInit] = mockedFetch.mock.calls[2] as [
        string,
        RequestInit,
      ];
      expect(kickUrl).toContain("/kick");
      const body = JSON.parse(kickInit.body as string);
      expect(body.userid).toBe("steam_99999999999999999");
    });

    it("Ne kick personne si tous les joueurs sont whitelistés", async () => {
      const server = await GameServer.create({
        name: "Palworld",
        gameData: {
          slug: "palworld",
          type: "palworld",
          containerName: "palworld-server",
        },
      });
      const whitelistedUser = await User.create({
        username: "alice",
        email: "alice@linchoy.com",
        password: "MotDePasse123!",
        steamId: "76561198000000001",
      });
      await ServerWhitelist.create({
        user: whitelistedUser._id,
        gameServer: server._id,
      });
      getContainerStateMock.mockResolvedValue({ running: true });

      const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockedFetch
        .mockResolvedValueOnce(jsonResponse({ servername: "Mon Pal" }))
        .mockResolvedValueOnce(
          jsonResponse({
            players: [{ name: "Alice", userId: "steam_76561198000000001" }],
          }),
        );

      await syncGameServerData();

      expect(mockedFetch).toHaveBeenCalledTimes(2);
    });
  });
});
