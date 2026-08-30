import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import serverStatusRouter from "./routes/serverStatus.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import gameServerRouter from "./routes/gamesServer.js";
import steamRouter from "./routes/steam.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Route
app.use("/server", serverStatusRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/games", gameServerRouter);
app.use("/steam", steamRouter);

// Check
app.use((req, res) => {
  res.status(404).json({ result: false, message: "Not found" });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ result: false, message: "Internal server error" });
  },
);

export default app;
