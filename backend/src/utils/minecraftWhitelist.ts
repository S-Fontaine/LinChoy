export async function addToServerWhitelist(username: string): Promise<void> {
  // TODO: brancher sur RCON (enable-rcon=true côté server.properties)
  console.log(`[minecraft-whitelist] TODO whitelist add ${username}`);
}

export async function removeFromServerWhitelist(username: string): Promise<void> {
  // TODO: brancher sur RCON
  console.log(`[minecraft-whitelist] TODO whitelist remove ${username}`);
}