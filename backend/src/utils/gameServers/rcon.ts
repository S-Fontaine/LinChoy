import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function runRconCommand(
  host: string,
  port: string,
  password: string,
  command: string,
): Promise<void> {
  await execFileAsync("mcrcon", ["-H", host, "-P", port, "-p", password, command]);
}
