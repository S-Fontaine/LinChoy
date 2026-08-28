import mongoose, { Schema } from "mongoose";
import PalworldSchema, {
  type IPalworld,
} from "./subdocuments/palworld.schema.js";

export type GameServerType = "palworld" | "minecraft" | "protocol-valve";

export interface IGameServerStatus {
  online: boolean;
  playerCount: number;
  maxPlayers?: number;
  version?: string;
  players?: Array<string>;
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
  queryPort?: number;
  status: IGameServerStatus;
  comingSoon: boolean;
  palworldData?: IPalworld;
}

const GameServerSchema = new Schema<IGameServer>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["palworld", "minecraft", "protocol-valve"],
    required: true,
  },
  containerName: { type: String, required: true },
  image: { type: String, default: "" },
  address: String,
  port: Number,
  queryPort: Number,
  status: {
    version: String,
    online: { type: Boolean, default: false },
    playerCount: { type: Number, default: 0 },
    maxPlayers: Number,
    players: [String],
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
