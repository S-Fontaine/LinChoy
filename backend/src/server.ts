import app from "./app.js";
import { connectDB, disconnectDB } from "./models/connection.js";
import { syncGameServers } from "./utils/syncGameServers.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[server]: Serveur démarré sur http://localhost:${PORT}`);
    });

    syncGameServers();
    const syncInterval = setInterval(() => {
      syncGameServers();
    }, 30000);

    const shutdown = (signal: string) => {
      console.log(`[server]: Signal ${signal} reçu, arrêt en cours...`);
      clearInterval(syncInterval);
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
