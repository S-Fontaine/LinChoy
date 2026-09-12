import type { HydratedDocument } from "mongoose";
import type { IGameServer } from "../models/GameServer.js";

export interface GameProvider {
  syncWhitelist?(server: HydratedDocument<IGameServer>): Promise<void>;
  announce?(server: HydratedDocument<IGameServer>, message: string): Promise<void>;
  save?(server: HydratedDocument<IGameServer>): Promise<void>;
  getPlayers?(
    server: HydratedDocument<IGameServer>,
  ): Promise<Array<{ id: string; name: string }>>;
}
