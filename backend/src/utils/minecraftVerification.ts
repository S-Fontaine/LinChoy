import User from "../models/User.js";
import GameServer from "../models/GameServer.js";
import { removeFromServerWhitelist } from "./minecraftWhitelist.js";

export const MINECRAFT_LINK_TTL_MS =
  (Number(process.env.MINECRAFT_LINK_TTL_HOURS) || 4) * 60 * 60 * 1000;

export function getMinecraftLinkExpiresAt(linkedAt: Date | null): Date | null {
  return linkedAt ? new Date(linkedAt.getTime() + MINECRAFT_LINK_TTL_MS) : null;
}

export async function verifyOnlineMinecraftLinks(): Promise<void> {
  const minecraftServers = await GameServer.find({ type: "minecraft" });
  const onlineNames = new Set(
    minecraftServers
      .flatMap((server) => server.status.players ?? [])
      .map((name) => name.toLowerCase()),
  );

  if (onlineNames.size === 0) return;

  const pendingUsers = await User.find({
    minecraftVerified: false,
    minecraftUsername: { $ne: null },
  });

  for (const user of pendingUsers) {
    if (
      user.minecraftUsername &&
      onlineNames.has(user.minecraftUsername.toLowerCase())
    ) {
      await User.findByIdAndUpdate(user._id, { minecraftVerified: true });
      console.log(
        `[minecraft-link] ${user.minecraftUsername} vérifié (connecté en jeu)`,
      );
    }
  }
}

export async function cleanupExpiredMinecraftLinks(): Promise<void> {
  const cutoff = new Date(Date.now() - MINECRAFT_LINK_TTL_MS);

  const expiredUsers = await User.find({
    minecraftVerified: false,
    minecraftLinkedAt: { $lt: cutoff },
  });

  for (const user of expiredUsers) {
    if (user.minecraftUsername) {
      await removeFromServerWhitelist(user.minecraftUsername);
    }
    await User.findByIdAndUpdate(user._id, {
      minecraftUuid: null,
      minecraftUsername: null,
      minecraftVerified: false,
      minecraftLinkedAt: null,
    });
    console.log(
      `[minecraft-link] Liaison expirée et libérée pour l'utilisateur ${user._id}`,
    );
  }
}