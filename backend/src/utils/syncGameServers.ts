import GameServer from "../models/GameServer.js";
import { syncGameServerData } from "./getPalworldData.js";
import { getContainerState } from "./docker.js";
import { getSourceQueryStatus } from "./gameStatusProviders.js";

export async function syncGameServers() {
  const servers = await GameServer.find({ comingSoon: { $ne: true } });

  for (const server of servers) {
    if (server.type === "palworld") {
      await syncGameServerData();
      continue;
    }

    if (!server.address || !server.port) {
      console.warn(`[sync] ${server.name} : address/port manquant, ignoré`);
      continue;
    }

    let containerRunning = false;
    try {
      const container = await getContainerState(server.containerName);
      containerRunning = container.running;
    } catch (err) {
      console.warn(
        `[sync] ${server.name} : container "${server.containerName}" introuvable`,
      );
    }

    if (!containerRunning) {
      await GameServer.updateOne(
        { _id: server._id },
        {
          $set: {
            "status.online": false,
            "status.playerCount": 0,
            "status.lastChecked": new Date(),
          },
        },
      );
      continue;
    }

    const status = await getSourceQueryStatus(
      server.address,
      Number(server.queryPort),
      server.type,
    );

    await GameServer.updateOne(
      { _id: server._id },
      {
        $set: {
          "status.online": status.online,
          "status.version": status.version,
          "status.playerCount": status.playerCount,
          "status.maxPlayers": status.maxPlayers,
          "status.lastChecked": new Date(),
          "status.players": status.players,
          "status.displayName": status.displayName,
        },
      },
    );
  }

  console.log(
    `[${new Date().toLocaleTimeString()}] Synchro des serveurs terminée`,
  );
}
