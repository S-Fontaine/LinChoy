import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function readSyncedIds(stateFile: string): Promise<string[]> {
  try {
    const raw = await fs.readFile(stateFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function syncValheimWhitelist(
  containerName: string,
  steamIds: string[],
): Promise<void> {
  const dataDir = path.join(process.env.WHITELISTS_DATA_DIR!, containerName);
  const stateFile = path.join(dataDir, "permittedlist.synced.json");

  const previousIds = await readSyncedIds(stateFile);
  const previousSet = new Set(previousIds);
  const desiredSet = new Set(steamIds);

  const toAdd = steamIds.filter((id) => !previousSet.has(id));
  const toRemove = previousIds.filter((id) => !desiredSet.has(id));
  const commands = [
    ...toAdd.map((id) => `addPermitted ${id}`),
    ...toRemove.map((id) => `removePermitted ${id}`),
  ];

  if (commands.length > 0) {
    await execFileAsync("mcrcon", [
      "-H",
      process.env.VALHEIM_RCON_HOST!,
      "-P",
      process.env.VALHEIM_RCON_PORT!,
      "-p",
      process.env.VALHEIM_RCON_PASSWORD!,
      ...commands,
    ]);
  }

  await fs.mkdir(dataDir, { recursive: true });
  const tmpFile = `${stateFile}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(steamIds), "utf8");
  await fs.chmod(tmpFile, 0o644);
  await fs.rename(tmpFile, stateFile);
}
