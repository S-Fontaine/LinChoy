import mongoose, { Schema } from "mongoose";

export interface IServerWhitelist {
  user: mongoose.Types.ObjectId;
  gameServer: mongoose.Types.ObjectId;
  whitelistedAt: Date;
}

const ServerWhitelistSchema = new Schema<IServerWhitelist>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gameServer: {
    type: Schema.Types.ObjectId,
    ref: "GameServer",
    required: true,
  },
  whitelistedAt: { type: Date, default: Date.now },
});

ServerWhitelistSchema.index({ user: 1, gameServer: 1 }, { unique: true });

export default mongoose.model<IServerWhitelist>(
  "ServerWhitelist",
  ServerWhitelistSchema,
  "ServerWhitelist",
);