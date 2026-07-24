import mongoose, { Schema } from "mongoose";
import PalworldSchema, {
  type IPalworld,
} from "./subdocuments/palworld.schema.js";

export interface IGameServer {
  name: string;
  palworldData?: IPalworld;
}

const GameServerSchema = new Schema<IGameServer>({
  name: { type: String, required: true },
  palworldData: PalworldSchema,
});

export default mongoose.model<IGameServer>(
  "GameServer",
  GameServerSchema,
  "GameServer",
);
