import ServerWhitelist from "../../models/ServerWhitelist.js";
import { runRconCommand } from "../shared/rcon.js";
import { syncMinecraftWhitelist } from "./whitelist.js";
import type { GameProvider } from "../types.js";

export const minecraftProvider: GameProvider = {
  async syncWhitelist(server) {
    const entries = await ServerWhitelist.find({
      gameServer: server._id,
    }).populate<{
      user: { minecraftUuid: string | null; minecraftUsername: string | null };
    }>("user", "minecraftUuid minecraftUsername");

    const players = entries
      .filter((e) => e.user?.minecraftUuid && e.user?.minecraftUsername)
      .map((e) => ({
        uuid: e.user.minecraftUuid!,
        name: e.user.minecraftUsername!,
      }));

    await syncMinecraftWhitelist(
      server.gameData.containerName,
      server.hostInfo.address,
      server.hostInfo.port,
      server.hostInfo.password,
      players,
    );
  },

  async announce(server, message) {
    await runRconCommand(
      server.hostInfo.address,
      String(server.hostInfo.port ?? ""),
      server.hostInfo.password,
      `say ${message}`,
    );
  },

  async save(server) {
    await runRconCommand(
      server.hostInfo.address,
      String(server.hostInfo.port ?? ""),
      server.hostInfo.password,
      "save-all",
    );
  },
};
