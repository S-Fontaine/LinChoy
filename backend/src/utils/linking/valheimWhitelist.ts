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
  hostAddress: string,
  hostPort: number,
  hostPassword: string,
  steamIds: string[],
): Promise<void> {
  const dataDir = path.join("/whitelist", containerName);
  const stateFile = path.join(dataDir, "permittedlist.synced.json");

  const previousIds = await readSyncedIds(stateFile);
  const previousSet = new Set(previousIds);
  const desiredSet = new Set(steamIds);

  const toAdd = steamIds.filter((id) => !previousSet.has(id));
  const toRemove = previousIds.filter((id) => !desiredSet.has(id));
  const commands = [
    ...toAdd.map((id) => `addPermitted V_${id}`),
    ...toRemove.map((id) => `removePermitted V_${id}`),
  ];

  if (commands.length > 0) {
    await execFileAsync("mcrcon", [
      "-H",
      hostAddress,
      "-P",
      String(hostPort),
      "-p",
      hostPassword,
      ...commands,
    ]);
  }

  await fs.mkdir(dataDir, { recursive: true });
  const tmpFile = `${stateFile}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(steamIds), "utf8");
  await fs.chmod(tmpFile, 0o644);
  await fs.rename(tmpFile, stateFile);
}
