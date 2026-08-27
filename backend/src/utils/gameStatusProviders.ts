import { GameDig } from "gamedig";
import { status as mcStatus } from "minecraft-server-util";

export interface IGameStatusResult {
  online: boolean;
  playerCount: number;
  maxPlayers?: number;
}

export async function getMinecraftStatus(
  address: string,
  port: number,
): Promise<IGameStatusResult> {
  try {
    const result = await mcStatus(address, port, { timeout: 5000 });
    return {
      online: true,
      playerCount: result.players.online,
      maxPlayers: result.players.max,
    };
  } catch {
    return { online: false, playerCount: 0 };
  }
}

export async function getSourceQueryStatus(
  address: string,
  port: number,
): Promise<IGameStatusResult> {
  try {
    const result = await GameDig.query({
      type: "protocol-valve",
      host: address,
      port,
      maxRetries: 1,
      socketTimeout: 5000,
    });
    return {
      online: true,
      playerCount: result.players.length,
      maxPlayers: result.maxplayers,
    };
  } catch {
    return { online: false, playerCount: 0 };
  }
}
