import GameServer from "../models/GameServer.js";
import { isServerOnline } from "./docker.js";
import { syncGameServerData } from "./getPalworldData.js";

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

    const online = await isServerOnline(server.address, server.port);

    await GameServer.updateOne(
      { _id: server._id },
      {
        $set: {
          "status.online": online,
          "status.lastChecked": new Date(),
        },
      },
    );
  }

  console.log(
    `[${new Date().toLocaleTimeString()}] Synchro des serveurs terminée`,
  );
}
