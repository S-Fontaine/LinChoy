import mongoose, { Schema, Types } from "mongoose";
export type GameServerType = "palworld" | "minecraft" | "protocol-valve";
export type GameServerState = "offline" | "starting" | "online";

export interface IConnectionInfo {
  address: string;
  port: number;
  password: string;
  queryPort: number;
}

export interface IPlayerInfo {
  playerCount: number;
  maxPlayers: number;
  players: Array<{ id: string; name: string }>;
}

export interface IServerInfo {
  displayName: string;
  version: string;
  image: string;
  description: string;
}

export interface IStatusInfo {
  online: boolean;
  comingSoon: boolean;
  state: GameServerState;
  lastChecked: Date;
}

export interface IGameData {
  type: GameServerType;
  containerName: string;
  slug: string;
}

export interface IHostInfo {
  address: string;
  port: number;
  password: string;
}

export interface IGameServer {
  _id: Types.ObjectId;
  name: string;
  connectionInfo: IConnectionInfo;
  playerInfo: IPlayerInfo;
  serverInfo: IServerInfo;
  statusInfo: IStatusInfo;
  gameData: IGameData;
  hostInfo: IHostInfo;
}

// Sous-Document
const ConnectionInfoSchema = new Schema<IConnectionInfo>(
  {
    address: String,
    port: Number,
    password: String,
    queryPort: Number,
  },
  { _id: false },
);
const PlayerInfoSchema = new Schema<IPlayerInfo>(
  {
    playerCount: { type: Number, default: 0 },
    maxPlayers: Number,
    players: [
      {
        _id: false,
        id: { type: String, required: false },
        name: { type: String, required: true },
      },
    ],
  },
  { _id: false },
);
const ServerInfoSchema = new Schema<IServerInfo>(
  {
    displayName: String,
    version: String,
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);
const StatusInfoSchema = new Schema<IStatusInfo>(
  {
    online: { type: Boolean, default: false },
    comingSoon: { type: Boolean, default: false },
    state: {
      type: String,
      enum: ["offline", "starting", "online"],
      default: "offline",
    },
    lastChecked: Date,
  },
  { _id: false },
);
const GameDataSchema = new Schema<IGameData>(
  {
    type: {
      type: String,
      enum: ["palworld", "minecraft", "protocol-valve"],
      required: true,
    },
    containerName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { _id: false },
);
const HostInfoSchema = new Schema<IHostInfo>(
  {
    address: { type: String, default: "" },
    port: Number,
    password: { type: String, default: "" },
  },
  { _id: false },
);

// Document
const GameServerSchema = new Schema<IGameServer>({
  name: { type: String, required: true, unique: true },
  connectionInfo: { type: ConnectionInfoSchema, default: () => ({}) },
  playerInfo: { type: PlayerInfoSchema, default: () => ({}) },
  serverInfo: { type: ServerInfoSchema, default: () => ({}) },
  statusInfo: { type: StatusInfoSchema, default: () => ({}) },
  gameData: { type: GameDataSchema, default: () => ({}) },
  hostInfo: { type: HostInfoSchema, default: () => ({}) },
});

export default mongoose.model<IGameServer>(
  "GameServer",
  GameServerSchema,
  "GameServer",
);
