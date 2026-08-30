const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";

export function getSteamRedirectUrl(returnUrl: string, realm: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnUrl,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

export async function verifySteamOpenId(
  query: Record<string, string>,
): Promise<string> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    params.append(key, value);
  }
  params.set("openid.mode", "check_authentication");

  const res = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const text = await res.text();

  if (!text.includes("is_valid:true")) {
    throw new Error("Signature Steam invalide");
  }

  const claimedId = query["openid.claimed_id"];
  const match = claimedId?.match(/\/openid\/id\/(\d+)$/);
  const steamId = match?.[1];

  if (!steamId) {
    throw new Error("Impossible d'extraire le SteamID de la réponse");
  }

  return steamId;
}
