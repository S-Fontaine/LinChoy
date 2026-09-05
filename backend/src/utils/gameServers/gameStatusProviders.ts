import { GameDig } from "gamedig";

export interface IGameStatusResult {
  online: boolean;
  playerCount: number;
  maxPlayers?: number;
  version?: string;
  players?: Array<string>;
  displayName?: string;
}

export async function getSourceQueryStatus(
  address: string,
  port: number,
  type: string,
): Promise<IGameStatusResult> {
  try {
    const result = await GameDig.query({
      type,
      host: address,
      port,
      maxRetries: 1,
      socketTimeout: 5000,
    });
    return {
      online: true,
      playerCount: result.players.length,
      maxPlayers: result.maxplayers,
      version: result.version,
      players: result.players
        .map((p) => p.name)
        .filter((name): name is string => Boolean(name)),
      displayName: result.name,
    };
  } catch {
    return { online: false, playerCount: 0 };
  }
}
