import GameServer, { type GameServerType } from "../../models/GameServer.js";
import ServerWhitelist from "../../models/ServerWhitelist.js";
import {
  addToServerWhitelist as addMinecraft,
  removeFromServerWhitelist as removeMinecraft,
} from "./minecraftWhitelist.js";
import {
  addToSteamWhitelist,
  removeFromSteamWhitelist,
} from "./steamWhitelist.js";

interface WhitelistTarget {
  type: GameServerType;
  containerName: string;
  identifier: string;
}

export async function addToWhitelist(target: WhitelistTarget): Promise<void> {
  if (target.type === "minecraft") {
    return addMinecraft(target.containerName, target.identifier);
  }
  return addToSteamWhitelist(target.containerName, target.identifier);
}

export async function removeFromWhitelist(
  target: WhitelistTarget,
): Promise<void> {
  if (target.type === "minecraft") {
    return removeMinecraft(target.containerName, target.identifier);
  }
  return removeFromSteamWhitelist(target.containerName, target.identifier);
}

export async function revokeAllWhitelistsForUser(
  userId: string,
  accountType: "steam" | "minecraft",
  identifier: string,
): Promise<void> {
  const gameTypes: GameServerType[] =
    accountType === "minecraft"
      ? ["minecraft"]
      : ["palworld", "protocol-valve"];

  const servers = await GameServer.find({
    "gameData.type": { $in: gameTypes },
  });
  const serverIds = servers.map((s) => s._id);

  const entries = await ServerWhitelist.find({
    user: userId,
    gameServer: { $in: serverIds },
  });

  for (const entry of entries) {
    const server = servers.find((s) => s._id.equals(entry.gameServer));
    if (!server) continue;
    await removeFromWhitelist({
      type: server.gameData.type,
      containerName: server.gameData.containerName,
      identifier,
    });
    await entry.deleteOne();
  }
}
