import mongoose, { Schema } from "mongoose";
import PalworldSchema, {
  type IPalworld,
} from "./subdocuments/palworld.schema.js";

export type GameServerType = "palworld" | "minecraft" | "vrising" | "valheim";

export interface IGameServerStatus {
  online: boolean;
  playerCount: number;
  maxPlayers?: number;
  lastChecked?: Date;
  displayName?: string;
  description?: string;
}

export interface IGameServer {
  name: string;
  slug: string;
  type: GameServerType;
  containerName: string;
  image: string;
  address?: string;
  port?: number;
  status: IGameServerStatus;
  comingSoon: boolean;
  palworldData?: IPalworld;
}

const GameServerSchema = new Schema<IGameServer>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["palworld", "minecraft", "vrising", "valheim"],
    required: true,
  },
  containerName: { type: String, required: true },
  image: { type: String, default: "" },
  address: String,
  port: Number,
  status: {
    online: { type: Boolean, default: false },
    playerCount: { type: Number, default: 0 },
    maxPlayers: Number,
    lastChecked: Date,
    displayName: String,
    description: String,
  },
  comingSoon: { type: Boolean, default: false },
  palworldData: PalworldSchema,
});

export default mongoose.model<IGameServer>(
  "GameServer",
  GameServerSchema,
  "GameServer",
);
