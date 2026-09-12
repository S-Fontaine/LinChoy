import { describe, it, expect } from "@jest/globals";
import User from "../../../src/models/User.js";
import GameServer from "../../../src/models/GameServer.js";
import ServerWhitelist from "../../../src/models/ServerWhitelist.js";
import { cleanupExpiredMinecraftLinks } from "../../../src/games/minecraft/verification.js";

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

describe("Test util: cleanupExpiredMinecraftLinks", () => {
  it("Révoque les whitelists Minecraft des liaisons expirées et non vérifiées", async () => {
    const server = await GameServer.create({
      name: "Minecraft",
      gameData: {
        slug: "minecraft",
        type: "minecraft",
        containerName: "mc-server",
      },
    });
    const user = await User.create({
      ...userPayload,
      minecraftUuid: "uuid-1",
      minecraftUsername: "Notch",
      minecraftVerified: false,
      minecraftLinkedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    });
    await ServerWhitelist.create({ user: user._id, gameServer: server._id });

    await cleanupExpiredMinecraftLinks();

    const updated = await User.findById(user._id);
    expect(updated?.minecraftUsername).toBeNull();
    expect(updated?.minecraftUuid).toBeNull();

    const remaining = await ServerWhitelist.findOne({
      user: user._id,
      gameServer: server._id,
    });
    expect(remaining).toBeNull();
  });

  it("Ne touche pas aux liaisons déjà vérifiées, même expirées", async () => {
    const server = await GameServer.create({
      name: "Minecraft",
      gameData: {
        slug: "minecraft",
        type: "minecraft",
        containerName: "mc-server",
      },
    });
    const user = await User.create({
      ...userPayload,
      minecraftUuid: "uuid-1",
      minecraftUsername: "Notch",
      minecraftVerified: true,
      minecraftLinkedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    });
    await ServerWhitelist.create({ user: user._id, gameServer: server._id });

    await cleanupExpiredMinecraftLinks();

    const updated = await User.findById(user._id);
    expect(updated?.minecraftUsername).toBe("Notch");

    const remaining = await ServerWhitelist.findOne({
      user: user._id,
      gameServer: server._id,
    });
    expect(remaining).not.toBeNull();
  });

  it("Ne touche pas aux liaisons encore dans le délai", async () => {
    const user = await User.create({
      ...userPayload,
      minecraftUuid: "uuid-1",
      minecraftUsername: "Notch",
      minecraftVerified: false,
      minecraftLinkedAt: new Date(),
    });

    await cleanupExpiredMinecraftLinks();

    const updated = await User.findById(user._id);
    expect(updated?.minecraftUsername).toBe("Notch");
  });
});
