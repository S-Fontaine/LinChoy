import GameServer, {
  type IGameServer,
  type GameServerType,
} from "../../models/GameServer.js";
import ServerWhitelist from "../../models/ServerWhitelist.js";
import { syncMinecraftWhitelist } from "./minecraftWhitelist.js";
import { syncValheimWhitelist } from "./valheimWhitelist.js";

export async function syncWhitelist(server: IGameServer): Promise<void> {
  if (server.gameData.slug === "minecraft-hard") {
    const entries = await ServerWhitelist.find({
      gameServer: server._id,
    }).populate<{
      user: { minecraftUuid: string | null; minecraftUsername: string | null };
    }>("user", "minecraftUuid minecraftUsername");

    const players = entries
      .filter((e) => e.user?.minecraftUuid && e.user?.minecraftUsername)
      .map((e) => ({
        uuid: e.user.minecraftUuid!,
        name: e.user.minecraftUsername!,
      }));

    return syncMinecraftWhitelist(server.gameData.containerName, players);
  }

  if (server.gameData.slug === "valheim") {
    const entries = await ServerWhitelist.find({
      gameServer: server._id,
    }).populate<{ user: { steamId: string | null } }>("user", "steamId");

    const steamIds = entries
      .filter((e) => e.user?.steamId)
      .map((e) => e.user.steamId!);

    return syncValheimWhitelist(server.gameData.containerName, steamIds);
  }

  //TODO: V Rising
  //TODO: Palworld
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
