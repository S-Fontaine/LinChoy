import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";

const addMinecraftMock =
  jest.fn<(containerName: string, username: string) => Promise<void>>();
const removeMinecraftMock =
  jest.fn<(containerName: string, username: string) => Promise<void>>();
const addSteamMock =
  jest.fn<(containerName: string, steamId: string) => Promise<void>>();
const removeSteamMock =
  jest.fn<(containerName: string, steamId: string) => Promise<void>>();

jest.unstable_mockModule(
  "../../src/utils/linking/minecraftWhitelist.js",
  () => ({
    addToServerWhitelist: addMinecraftMock,
    removeFromServerWhitelist: removeMinecraftMock,
  }),
);

jest.unstable_mockModule("../../src/utils/linking/steamWhitelist.js", () => ({
  addToSteamWhitelist: addSteamMock,
  removeFromSteamWhitelist: removeSteamMock,
}));

const { addToWhitelist, removeFromWhitelist, revokeAllWhitelistsForUser } =
  await import("../../src/utils/linking/gameWhitelist.js");
const { default: GameServer } = await import("../../src/models/GameServer.js");
const { default: ServerWhitelist } = await import(
  "../../src/models/ServerWhitelist.js"
);

describe("Test util: gameWhitelist", () => {
  beforeEach(() => {
    addMinecraftMock.mockReset();
    removeMinecraftMock.mockReset();
    addSteamMock.mockReset();
    removeSteamMock.mockReset();
  });

  describe("addToWhitelist", () => {
    it("Appelle le whitelist Minecraft pour le type minecraft", async () => {
      await addToWhitelist({
        type: "minecraft",
        containerName: "mc-server",
        identifier: "Notch",
      });

      expect(addMinecraftMock).toHaveBeenCalledWith("mc-server", "Notch");
      expect(addSteamMock).not.toHaveBeenCalled();
    });

    it("Appelle le whitelist Steam pour le type protocol-valve", async () => {
      await addToWhitelist({
        type: "protocol-valve",
        containerName: "vrising-server",
        identifier: "76561198000000000",
      });

      expect(addSteamMock).toHaveBeenCalledWith(
        "vrising-server",
        "76561198000000000",
      );
      expect(addMinecraftMock).not.toHaveBeenCalled();
    });

    it("Appelle le whitelist Steam pour le type palworld", async () => {
      await addToWhitelist({
        type: "palworld",
        containerName: "pal-server",
        identifier: "76561198000000000",
      });

      expect(addSteamMock).toHaveBeenCalledWith(
        "pal-server",
        "76561198000000000",
      );
    });
  });

  describe("removeFromWhitelist", () => {
    it("Appelle removeFromServerWhitelist pour minecraft", async () => {
      await removeFromWhitelist({
        type: "minecraft",
        containerName: "mc-server",
        identifier: "Notch",
      });

      expect(removeMinecraftMock).toHaveBeenCalledWith("mc-server", "Notch");
    });

    it("Appelle removeFromSteamWhitelist pour les jeux Steam", async () => {
      await removeFromWhitelist({
        type: "palworld",
        containerName: "pal-server",
        identifier: "76561198000000000",
      });

      expect(removeSteamMock).toHaveBeenCalledWith(
        "pal-server",
        "76561198000000000",
      );
    });
  });

  describe("revokeAllWhitelistsForUser", () => {
    it("Révoque uniquement les whitelists Minecraft et laisse les autres intactes", async () => {
      const mcServer = await GameServer.create({
        name: "Minecraft",
        slug: "minecraft",
        type: "minecraft",
        containerName: "mc-server",
      });
      const steamServer = await GameServer.create({
        name: "V Rising",
        slug: "vrising",
        type: "protocol-valve",
        containerName: "vrising-server",
      });
      const userId = new mongoose.Types.ObjectId().toString();

      await ServerWhitelist.create({ user: userId, gameServer: mcServer._id });
      await ServerWhitelist.create({
        user: userId,
        gameServer: steamServer._id,
      });

      await revokeAllWhitelistsForUser(userId, "minecraft", "Notch");

      expect(removeMinecraftMock).toHaveBeenCalledWith("mc-server", "Notch");
      expect(removeSteamMock).not.toHaveBeenCalled();

      const remaining = await ServerWhitelist.find({ user: userId });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].gameServer.toString()).toBe(
        steamServer._id.toString(),
      );
    });

    it("Révoque les whitelists Steam (palworld + protocol-valve) mais pas Minecraft", async () => {
      const mcServer = await GameServer.create({
        name: "Minecraft",
        slug: "minecraft",
        type: "minecraft",
        containerName: "mc-server",
      });
      const palServer = await GameServer.create({
        name: "Palworld",
        slug: "palworld",
        type: "palworld",
        containerName: "pal-server",
      });
      const userId = new mongoose.Types.ObjectId().toString();

      await ServerWhitelist.create({ user: userId, gameServer: mcServer._id });
      await ServerWhitelist.create({
        user: userId,
        gameServer: palServer._id,
      });

      await revokeAllWhitelistsForUser(
        userId,
        "steam",
        "76561198000000000",
      );

      expect(removeSteamMock).toHaveBeenCalledWith(
        "pal-server",
        "76561198000000000",
      );
      expect(removeMinecraftMock).not.toHaveBeenCalled();

      const remaining = await ServerWhitelist.find({ user: userId });
      expect(remaining).toHaveLength(1);
      expect(remaining[0].gameServer.toString()).toBe(mcServer._id.toString());
    });

    it("Ne fait rien si l'utilisateur n'a aucune whitelist", async () => {
      const userId = new mongoose.Types.ObjectId().toString();

      await expect(
        revokeAllWhitelistsForUser(userId, "minecraft", "Notch"),
      ).resolves.toBeUndefined();
      expect(removeMinecraftMock).not.toHaveBeenCalled();
    });
  });
});