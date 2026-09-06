export async function addToSteamWhitelist(
  containerName: string,
  steamId: string,
): Promise<void> {
  // TODO: brancher sur le mécanisme de whitelist propre à chaque jeu Steam
  console.log(
    `[steam-whitelist] TODO whitelist add ${steamId} sur ${containerName}`,
  );
}

export async function removeFromSteamWhitelist(
  containerName: string,
  steamId: string,
): Promise<void> {
  // TODO: idem, retirer de la liste + reload
  console.log(
    `[steam-whitelist] TODO whitelist remove ${steamId} sur ${containerName}`,
  );
}