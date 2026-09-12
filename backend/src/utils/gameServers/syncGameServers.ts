import GameServer from "../../models/GameServer.js";
import { syncGameServerData } from "../../games/palworld/data.js";
import { getProvider } from "../../games/index.js";
import { getContainerState } from "./docker.js";
import { getSourceQueryStatus } from "./gameStatusProviders.js";
import { gameServerEvents } from "./gameServerEvents.js";

export async function syncGameServers() {
  let servers;
  try {
    servers = await GameServer.find({ "statusInfo.comingSoon": { $ne: true } });
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
      if (server.gameData.type === "palworld") {
        await syncGameServerData();
        const updated = await GameServer.findById(server._id);

        if (updated) {
          const hasChanged =
            before.statusInfo.state !== updated.statusInfo.state ||
            before.playerInfo.playerCount !== updated.playerInfo.playerCount;

          if (hasChanged) {
            gameServerEvents.emit("update", updated);
          }
        }
        continue;
      }

      if (!server.connectionInfo.address || !server.connectionInfo.port) {
        console.warn(`[sync] ${server.name} : address/port manquant, ignoré`);
        continue;
      }

      let containerRunning = false;
      try {
        const container = await getContainerState(
          server.gameData.containerName,
        );
        containerRunning = container.running;
      } catch {
        console.warn(
          `[sync] ${server.name} : container "${server.gameData.containerName}" introuvable`,
        );
      }

      if (!containerRunning) {
        const newState = "offline";
        const newPlayerCount = 0;

        await GameServer.updateOne(
          { _id: server._id },
          {
            $set: {
              "statusInfo.state": newState,
              "statusInfo.online": false,
              "playerInfo.playerCount": newPlayerCount,
              "statusInfo.lastChecked": new Date(),
            },
          },
        );

        const hasChanged =
          before.statusInfo.state !== newState ||
          before.playerInfo.playerCount !== newPlayerCount;

        if (hasChanged) {
          const updated = await GameServer.findById(server._id);
          gameServerEvents.emit("update", updated);
        }
        continue;
      }

      const status = await getSourceQueryStatus(
        server.connectionInfo.address,
        Number(server.connectionInfo.queryPort),
        server.gameData.type,
      );
      const newState = status.online ? "online" : "starting";
      const newPlayerCount = status.playerCount;

      const getPlayers = status.online
        ? getProvider(server.gameData.slug)?.getPlayers
        : undefined;
      if (getPlayers) {
        try {
          status.players = await getPlayers(server);
        } catch (err) {
          console.warn(
            `[sync] ${server.name} : échec de la récupération des joueurs via RCON`,
            err,
          );
        }
      }

      await GameServer.updateOne(
        { _id: server._id },
        {
          $set: {
            "statusInfo.state": newState,
            "statusInfo.online": status.online,
            "serverInfo.version": status.version,
            "playerInfo.playerCount": newPlayerCount,
            "playerInfo.maxPlayers": status.maxPlayers,
            "statusInfo.lastChecked": new Date(),
            "playerInfo.players": status.players,
            "serverInfo.displayName": status.displayName,
          },
        },
      );

      const hasChanged =
        before.statusInfo.state !== newState ||
        before.playerInfo.playerCount !== newPlayerCount;

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
