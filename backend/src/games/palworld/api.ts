import type { HydratedDocument } from "mongoose";
import type { IGameServer } from "../../models/GameServer.js";

export function palworldApiUrl(
  server: HydratedDocument<IGameServer>,
  path: string,
): string {
  return `http://${server.hostInfo.address}:${server.hostInfo.port}/v1/api${path}`;
}

export function palworldAuthHeader(server: HydratedDocument<IGameServer>): string {
  return (
    "Basic " + Buffer.from(`admin:${server.hostInfo.password}`).toString("base64")
  );
}
