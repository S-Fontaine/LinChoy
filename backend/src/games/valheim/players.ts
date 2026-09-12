import { runRconCommand } from "../shared/rcon.js";

const PLAYER_LINE = /^(.+?)\s+Steam ID:(\d+)/;

export function parseValheimPlayers(
  output: string,
): Array<{ id: string; name: string }> {
  return output
    .split("\n")
    .map((line) => line.match(PLAYER_LINE))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => ({ id: match[2]!, name: match[1]! }));
}

export async function getValheimPlayers(
  host: string,
  port: string,
  password: string,
): Promise<Array<{ id: string; name: string }>> {
  const output = await runRconCommand(host, port, password, "players");
  return parseValheimPlayers(output);
}
