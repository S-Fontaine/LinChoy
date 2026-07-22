import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPalworldInfo {
  version: string;
  servername: string;
  description: string;
  worldguid: string;
}

export interface IPalworldMetrics {
  serverfps: number;
  currentplayernum: number;
  serverframetime: number;
  maxplayernum: number;
  uptime: number;
  basecampnum: number;
  days: number;
}
export interface IPalworldPlayer {
  name: string;
  accountName: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
  building_count: number;
}

export interface IPalworld extends Document {
  palworld: string;
  info: IPalworldInfo;
  metrics: IPalworldMetrics;
  players: IPalworldPlayer[];
}

const playerSchema = new Schema<IPalworldPlayer>(
  {
    name: { type: String, required: true },
    accountName: { type: String, required: true },
    playerId: { type: String, required: true },
    userId: { type: String, required: true },
    ip: String,
    ping: Number,
    location_x: Number,
    location_y: Number,
    level: Number,
    building_count: Number,
  },
  { _id: false },
);

const PalworldSchema = new Schema<IPalworld>({
  palworld: { type: String, default: "Palworld" },
  info: {
    version: String,
    servername: String,
    description: String,
    worldguid: String,
  },
  metrics: {
    serverfps: Number,
    currentplayernum: Number,
    serverframetime: Number,
    maxplayernum: Number,
    uptime: Number,
    basecampnum: Number,
    days: Number,
  },
  players: [playerSchema],
});

export default mongoose.model<IPalworld>(
  "Palworld",
  PalworldSchema,
  "palworld",
);
