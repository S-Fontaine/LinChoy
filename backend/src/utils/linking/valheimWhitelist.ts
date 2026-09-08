import fs from "fs/promises";
import path from "path";

export async function syncValheimWhitelist(
  containerName: string,
  steamIds: string[],
): Promise<void> {
  const dataDir = path.join(process.env.WHITELISTS_DATA_DIR!, containerName);
  const targetFile = path.join(dataDir, "permittedlist.txt");
  const tmpFile = path.join(dataDir, "permittedlist.txt.tmp");

  await fs.writeFile(tmpFile, steamIds.join("\n"),"utf8");
  await fs.chmod(tmpFile, 0o644);
  await fs.rename(tmpFile, targetFile);
}
