import type { HydratedDocument } from "mongoose";
import GameServer, {
  type IGameServer,
  type GameServerType,
} from "../models/GameServer.js";
import ServerWhitelist from "../models/ServerWhitelist.js";
import type { GameProvider } from "./types.js";
import { valheimProvider } from "./valheim/provider.js";
import { minecraftProvider } from "./minecraft/provider.js";
import { palworldProvider } from "./palworld/provider.js";
import { vrisingProvider } from "./vrising/provider.js";

const gameProviders: Record<string, GameProvider> = {
  valheim: valheimProvider,
  "minecraft-hard": minecraftProvider,
  palworld: palworldProvider,
  vrising: vrisingProvider,
};

export function getProvider(slug: string): GameProvider | undefined {
  return gameProviders[slug];
}

export async function syncWhitelist(
  server: HydratedDocument<IGameServer>,
): Promise<void> {
  await getProvider(server.gameData.slug)?.syncWhitelist?.(server);
}

export async function revokeAllWhitelistsForUser(
  userId: string,
  accountType: "steam" | "minecraft",
): Promise<void> {
  const gameTypes: GameServerType[] =
    accountType === "minecraft"
      ? ["minecraft"]
      : ["palworld", "protocol-valve"];

  const servers = await GameServer.find({
    "gameData.type": { $in: gameTypes },
  });
  const serverIds = servers.map((s) => s._id);

  const affectedIds = await ServerWhitelist.find({
    user: userId,
    gameServer: { $in: serverIds },
  }).distinct("gameServer");

  await ServerWhitelist.deleteMany({
    user: userId,
    gameServer: { $in: serverIds },
  });

  for (const server of servers) {
    if (affectedIds.some((id) => id.equals(server._id))) {
      await syncWhitelist(server).catch((err) =>
        console.error(`[whitelist] échec resync ${server.gameData.slug}`, err),
      );
    }
  }
}
