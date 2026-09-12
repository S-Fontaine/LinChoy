import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";

const syncMinecraftMock =
  jest.fn<
    (
      containerName: string,
      hostAddress: string,
      hostPort: number,
      hostPassword: string,
      entries: { uuid: string; name: string }[],
    ) => Promise<void>
  >();
const syncValheimMock =
  jest.fn<
    (
      containerName: string,
      hostAddress: string,
      hostPort: number,
      hostPassword: string,
      steamIds: string[],
    ) => Promise<void>
  >();

jest.unstable_mockModule("../../src/games/minecraft/whitelist.js", () => ({
  syncMinecraftWhitelist: syncMinecraftMock,
}));

jest.unstable_mockModule("../../src/games/valheim/whitelist.js", () => ({
  syncValheimWhitelist: syncValheimMock,
}));

const { syncWhitelist, revokeAllWhitelistsForUser } =
  await import("../../src/games/index.js");
const { default: GameServer } = await import("../../src/models/GameServer.js");
const { default: ServerWhitelist } =
  await import("../../src/models/ServerWhitelist.js");
const { default: User } = await import("../../src/models/User.js");

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

describe("Test util: gameWhitelist", () => {
  beforeEach(() => {
    syncMinecraftMock.mockReset();
    syncMinecraftMock.mockResolvedValue(undefined);
    syncValheimMock.mockReset();
    syncValheimMock.mockResolvedValue(undefined);
  });

  describe("syncWhitelist", () => {
    it("Synchronise le fichier Minecraft avec les joueurs whitelistés (uuid + pseudo)", async () => {
      const server = await GameServer.create({
        name: "Minecraft",
        gameData: {
          slug: "minecraft-hard",
          type: "minecraft",
          containerName: "mc-server",
        },
        hostInfo: {
          address: "192.168.0.1",
          port: 65000,
          password: "Steve",
        },
      });
      const user = await User.create({
        ...userPayload,
        minecraftUuid: "uuid-1",
        minecraftUsername: "Notch",
      });
      await ServerWhitelist.create({ user: user._id, gameServer: server._id });

      await syncWhitelist(server);

      expect(syncMinecraftMock).toHaveBeenCalledWith(
        "mc-server",
        "192.168.0.1",
        65000,
        "Steve",
        [{ uuid: "uuid-1", name: "Notch" }],
      );
      expect(syncValheimMock).not.toHaveBeenCalled();
    });

    it("Ignore les utilisateurs whitelistés mais sans compte Minecraft valide", async () => {
      const server = await GameServer.create({
        name: "Minecraft",
        gameData: {
          slug: "minecraft-hard",
          type: "minecraft",
          containerName: "mc-server",
        },
        hostInfo: {
          address: "192.168.0.1",
          port: 65000,
          password: "Steve",
        },
      });
      const user = await User.create(userPayload);
      await ServerWhitelist.create({ user: user._id, gameServer: server._id });

      await syncWhitelist(server);

      expect(syncMinecraftMock).toHaveBeenCalledWith(
        "mc-server",
        "192.168.0.1",
        65000,
        "Steve",
        [],
      );
    });

    it("Synchronise le fichier Valheim avec les SteamID whitelistés", async () => {
      const server = await GameServer.create({
        name: "Valheim",
        gameData: {
          slug: "valheim",
          type: "protocol-valve",
          containerName: "valheim-server",
        },
        hostInfo: {
          address: "192.0.2.1",
          port: 65000,
          password: "123465",
        },
      });
      const user = await User.create({
        ...userPayload,
        steamId: "76561198000000000",
      });
      await ServerWhitelist.create({ user: user._id, gameServer: server._id });

      await syncWhitelist(server);

      expect(syncValheimMock).toHaveBeenCalledWith(
        "valheim-server",
        "192.0.2.1",
        65000,
        "123465",
        ["76561198000000000"],
      );
      expect(syncMinecraftMock).not.toHaveBeenCalled();
    });

    it("Ne fait rien pour un serveur sans whitelist fichier (V Rising, Palworld)", async () => {
      const server = await GameServer.create({
        name: "V Rising",
        gameData: {
          slug: "vrising",
          type: "protocol-valve",
          containerName: "vrising-server",
        },
      });

      await syncWhitelist(server);

      expect(syncMinecraftMock).not.toHaveBeenCalled();
      expect(syncValheimMock).not.toHaveBeenCalled();
    });
  });

  describe("revokeAllWhitelistsForUser", () => {
    it("Supprime les entrées Minecraft et resynchronise le fichier", async () => {
      const mcServer = await GameServer.create({
        name: "Minecraft",
        gameData: {
          slug: "minecraft-hard",
          type: "minecraft",
          containerName: "mc-server",
        },
        hostInfo: {
          address: "192.168.0.1",
          port: 65000,
          password: "Steve",
        },
      });
      const steamServer = await GameServer.create({
        name: "V Rising",
        gameData: {
          slug: "vrising",
          type: "protocol-valve",
          containerName: "vrising-server",
        },
      });
      const userId = new mongoose.Types.ObjectId().toString();

      await ServerWhitelist.create({ user: userId, gameServer: mcServer._id });
      await ServerWhitelist.create({
        user: userId,
        gameServer: steamServer._id,
      });

      await revokeAllWhitelistsForUser(userId, "minecraft");

      expect(syncMinecraftMock).toHaveBeenCalledWith(
        "mc-server",
        "192.168.0.1",
        65000,
        "Steve",
        [],
      );
      expect(syncValheimMock).not.toHaveBeenCalled();

      const remaining = await ServerWhitelist.find({ user: userId });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].gameServer.toString()).toBe(
        steamServer._id.toString(),
      );
    });

    it("Supprime les entrées Steam (palworld + protocol-valve) mais pas Minecraft", async () => {
      const mcServer = await GameServer.create({
        name: "Minecraft",
        gameData: {
          slug: "minecraft-hard",
          type: "minecraft",
          containerName: "mc-server",
        },
      });
      const valheimServer = await GameServer.create({
        name: "Valheim",
        gameData: {
          slug: "valheim",
          type: "protocol-valve",
          containerName: "valheim-server",
        },
        hostInfo: {
          address: "192.0.2.1",
          port: 65000,
          password: "123465",
        },
      });
      const userId = new mongoose.Types.ObjectId().toString();

      await ServerWhitelist.create({ user: userId, gameServer: mcServer._id });
      await ServerWhitelist.create({
        user: userId,
        gameServer: valheimServer._id,
      });

      await revokeAllWhitelistsForUser(userId, "steam");

      expect(syncValheimMock).toHaveBeenCalledWith(
        "valheim-server",
        "192.0.2.1",
        65000,
        "123465",
        [],
      );
      expect(syncMinecraftMock).not.toHaveBeenCalled();

      const remaining = await ServerWhitelist.find({ user: userId });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].gameServer.toString()).toBe(mcServer._id.toString());
    });

    it("Ne fait rien si l'utilisateur n'a aucune whitelist", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      await expect(
        revokeAllWhitelistsForUser(userId, "minecraft"),
      ).resolves.toBeUndefined();
      expect(syncMinecraftMock).not.toHaveBeenCalled();
    });
  });
});
