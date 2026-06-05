import "dotenv/config";
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import indexRouter from "./routes/index.js";
import serverStatusRouter from "./routes/server.js";

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Route
app.use("/", indexRouter);
app.use("/server", serverStatusRouter);

if (process.env.NODE_ENV === "production") {
  app.listen(PORT, () => {
    console.log(`🌐 API de monitoring en Production (HTTP) active sur le port ${PORT}`);
  });
} else {
    
  try {
    const sslOptions = {
      key: fs.readFileSync("./localhost+2-key.pem"),
      cert: fs.readFileSync("./localhost+2.pem"),
    };

    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`💻 API de monitoring Locale (HTTPS) sécurisée sur https://localhost:${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Erreur au lancement du serveur HTTPS Local :", error.message);
      console.log("💡 Astuce : Si tu es sur OVH, assure-toi que NODE_ENV=production est bien configuré.");
    }
  }
}

export default app;
