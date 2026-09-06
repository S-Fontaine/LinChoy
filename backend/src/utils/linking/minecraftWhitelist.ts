export async function addToServerWhitelist(
  containerName: string,
  username: string,
): Promise<void> {
  // TODO: brancher sur RCON du conteneur `containerName` (enable-rcon=true côté server.properties)
  console.log(
    `[minecraft-whitelist] TODO whitelist add ${username} sur ${containerName}`,
  );
}

export async function removeFromServerWhitelist(
  containerName: string,
  username: string,
): Promise<void> {
  // TODO: brancher sur RCON
  console.log(
    `[minecraft-whitelist] TODO whitelist remove ${username} sur ${containerName}`,
  );
}