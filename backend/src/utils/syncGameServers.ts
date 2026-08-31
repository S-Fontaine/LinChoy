import GameServer from "../models/GameServer.js";
import { syncGameServerData } from "./getPalworldData.js";
import { getContainerState } from "./docker.js";
import { getSourceQueryStatus } from "./gameStatusProviders.js";
import { gameServerEvents } from "./gameServerEvents.js";

export async function syncGameServers() {
  let servers;
  try {
    servers = await GameServer.find({ comingSoon: { $ne: true } });
  } catch (err) {
    console.error(
      "[sync] Impossible de récupérer la liste des serveurs :",
      err,
    );
    return;
  }

  for (const server of servers) {
    try {
      const before = server.toObject();
      if (server.type === "palworld") {
        await syncGameServerData();
        const updated = await GameServer.findById(server._id);

        if (updated) {
          const hasChanged =
            before.status.state !== updated.status.state ||
            before.status.playerCount !== updated.status.playerCount;

          if (hasChanged) {
            gameServerEvents.emit("update", updated);
          }
        }
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
      } catch {
        console.warn(
          `[sync] ${server.name} : container "${server.containerName}" introuvable`,
        );
      }

      if (!containerRunning) {
        const newState = "offline";
        const newPlayerCount = 0;

        await GameServer.updateOne(
          { _id: server._id },
          {
            $set: {
              "status.state": newState,
              "status.online": false,
              "status.playerCount": newPlayerCount,
              "status.lastChecked": new Date(),
            },
          },
        );

        const hasChanged =
          before.status.state !== newState ||
          before.status.playerCount !== newPlayerCount;

        if (hasChanged) {
          const updated = await GameServer.findById(server._id);
          gameServerEvents.emit("update", updated);
        }
        continue;
      }

      const status = await getSourceQueryStatus(
        server.address,
        Number(server.queryPort),
        server.type,
      );
      const newState = status.online ? "online" : "starting";
      const newPlayerCount = status.playerCount;

      await GameServer.updateOne(
        { _id: server._id },
        {
          $set: {
            "status.state": newState,
            "status.online": status.online,
            "status.version": status.version,
            "status.playerCount": newPlayerCount,
            "status.maxPlayers": status.maxPlayers,
            "status.lastChecked": new Date(),
            "status.players": status.players,
            "status.displayName": status.displayName,
          },
        },
      );

      const hasChanged =
        before.status.state !== newState ||
        before.status.playerCount !== newPlayerCount;

      if (hasChanged) {
        const updated = await GameServer.findById(server._id);
        gameServerEvents.emit("update", updated);
      }
    } catch (err) {
      console.error(`[sync] Échec de la synchro pour ${server.name} :`, err);
    }
  }

  console.log(
    `[${new Date().toLocaleTimeString()}] Synchro des serveurs terminée`,
  );
}