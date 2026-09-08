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
  entries: MinecraftWhitelistEntry[],
): Promise<void> {
  const dataDir = path.join(process.env.WHITELISTS_DATA_DIR!, containerName);
  const targetFile = path.join(dataDir, "whitelist.json");
  const tmpFile = path.join(dataDir, "whitelist.json.tmp");

  await fs.writeFile(tmpFile, JSON.stringify(entries, null, 2));
  await fs.chmod(tmpFile, 0o644);
  await fs.rename(tmpFile, targetFile);

  try {
    await execFileAsync("mcrcon", [
      "-H",
      process.env.MINECRAFT_RCON_HOST!,
      "-P",
      process.env.MINECRAFT_RCON_PORT!,
      "-p",
      process.env.MINECRAFT_RCON_PASSWORD!,
      "whitelist reload",
    ]);
  } catch(err) {
    console.warn("[whitelist] Fichier mis à jour, mais reload RCON échoué.", err);
  }
}
