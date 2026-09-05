const UUID_HEX_REGEX = /^[0-9a-f]{32}$/i;

function normalizeUuid(input: string): string | null {
  const stripped = input.replace(/-/g, "");
  return UUID_HEX_REGEX.test(stripped) ? stripped : null;
}

interface MojangProfile {
  id: string;
  name: string;
}

export async function resolveMinecraftPlayer(
  rawInput: string,
): Promise<{ uuid: string; username: string }> {
  const input = rawInput.trim();
  if (!input || input.length > 36) {
    throw new Error("invalid_input");
  }

  const uuid = normalizeUuid(input);
  const url = uuid
    ? `https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`
    : `https://api.minecraftservices.com/minecraft/profile/lookup/name/${encodeURIComponent(input)}`;

  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error("not_found");
  }
  if (!res.ok) {
    throw new Error("mojang_unavailable");
  }

  const data = (await res.json()) as MojangProfile;
  return { uuid: data.id, username: data.name };
}