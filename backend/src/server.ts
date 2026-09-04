import app from "./app.js";
import { connectDB, disconnectDB } from "./models/connection.js";
import { syncGameServers } from "./utils/syncGameServers.js";
import {
  verifyOnlineMinecraftLinks,
  cleanupExpiredMinecraftLinks,
} from "./utils/minecraftVerification.js";

const PORT = Number(process.env.PORT) || 5000;
const SYNC_ENABLED = process.env.SYNC_GAME_SERVERS !== "false";

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[server]: Serveur démarré sur http://localhost:${PORT}`);
    });

    let syncInterval: NodeJS.Timeout | undefined;
    let cleanupInterval: NodeJS.Timeout | undefined;

    if (SYNC_ENABLED) {
      syncGameServers()
        .then(() => verifyOnlineMinecraftLinks())
        .catch((err) => {
          console.error(
            "[server]: Erreur inattendue lors de la synchro initiale :",
            err,
          );
        });
      syncInterval = setInterval(() => {
        syncGameServers()
          .then(() => verifyOnlineMinecraftLinks())
          .catch((err) => {
            console.error(
              "[server]: Erreur inattendue lors de la synchro périodique :",
              err,
            );
          });
      }, 30000);
      cleanupInterval = setInterval(
        () => {
          cleanupExpiredMinecraftLinks().catch((err) => {
            console.error(
              "[server]: Erreur nettoyage liaisons Minecraft :",
              err,
            );
          });
        },
        15 * 60 * 1000,
      );
    }

    const shutdown = (signal: string) => {
      console.log(`[server]: Signal ${signal} reçu, arrêt en cours...`);
      if (syncInterval) clearInterval(syncInterval);
      if (cleanupInterval) clearInterval(cleanupInterval);
      server.close(async () => {
        await disconnectDB();
        console.log("[server]: Serveur et connexion DB arrêtés proprement.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("[server]: Échec du démarrage :", err);
    process.exit(1);
  }
}

startServer();
