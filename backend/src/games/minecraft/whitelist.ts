import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface MinecraftWhitelistEntry {
  uuid: string;
  name: string;
}

export async function syncMinecraftWhitelist(
  containerName: string,
  hostAddress: string,
  hostPort: number,
  hostPassword: string,
  entries: MinecraftWhitelistEntry[],
): Promise<void> {
  const dataDir = path.join("/whitelist", containerName);
  const targetFile = path.join(dataDir, "whitelist.json");
  const tmpFile = path.join(dataDir, "whitelist.json.tmp");

  await fs.writeFile(tmpFile, JSON.stringify(entries, null, 2));
  await fs.chmod(tmpFile, 0o644);
  await fs.rename(tmpFile, targetFile);

  try {
    await execFileAsync("mcrcon", [
      "-H",
      hostAddress,
      "-P",
      String(hostPort),
      "-p",
      hostPassword,
      "whitelist reload",
    ]);
  } catch(err) {
    console.warn("[whitelist] Fichier mis à jour, mais reload RCON échoué.", err);
  }
}
