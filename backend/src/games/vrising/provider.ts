import { runRconCommand } from "../shared/rcon.js";
import type { GameProvider } from "../types.js";

export const vrisingProvider: GameProvider = {
  async announce(server, message) {
    await runRconCommand(
      server.hostInfo.address,
      String(server.hostInfo.port ?? ""),
      server.hostInfo.password,
      `announce ${message}`,
    );
  },
};
