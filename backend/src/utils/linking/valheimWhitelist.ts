import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_PATH = path.join(__dirname, "whitelist-valheim.sh");
const TMP_DIR = "/tmp/linchoy-whitelists";

export async function syncValheimWhitelist(
  containerName: string,
  steamIds: string[],
): Promise<void> {
  await fs.mkdir(TMP_DIR, { recursive: true });
  const filePath = path.join(TMP_DIR, `${containerName}-permittedlist.txt`);
  await fs.writeFile(filePath, steamIds.join("\n"));

  await execFileAsync("bash", [SCRIPT_PATH, containerName, filePath]);
}
