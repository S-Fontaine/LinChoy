import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "whitelist-minecraft.sh");
const TMP_DIR = "/tmp/linchoy-whitelists";

export interface MinecraftWhitelistEntry {
  uuid: string;
  name: string;
}

export async function syncMinecraftWhitelist(
  containerName: string,
  entries: MinecraftWhitelistEntry[],
): Promise<void> {
  await fs.mkdir(TMP_DIR, { recursive: true });
  const filePath = path.join(TMP_DIR, `${containerName}-whitelist.json`);
  await fs.writeFile(filePath, JSON.stringify(entries, null, 2));

  await execFileAsync("bash", [SCRIPT_PATH, containerName, filePath]);
}