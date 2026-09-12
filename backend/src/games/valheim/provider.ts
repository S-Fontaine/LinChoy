import ServerWhitelist from "../../models/ServerWhitelist.js";
import { runRconCommand } from "../shared/rcon.js";
import { syncValheimWhitelist } from "./whitelist.js";
import { getValheimPlayers } from "./players.js";
import type { GameProvider } from "../types.js";

export const valheimProvider: GameProvider = {
  async syncWhitelist(server) {
    const entries = await ServerWhitelist.find({
      gameServer: server._id,
    }).populate<{ user: { steamId: string | null } }>("user", "steamId");

    const steamIds = entries
      .filter((e) => e.user?.steamId)
      .map((e) => e.user.steamId!);

    await syncValheimWhitelist(
      server.gameData.containerName,
      server.hostInfo.address,
      server.hostInfo.port,
      server.hostInfo.password,
      steamIds,
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

  async getPlayers(server) {
    return getValheimPlayers(
      server.hostInfo.address,
      String(server.hostInfo.port ?? ""),
      server.hostInfo.password,
    );
  },
};
