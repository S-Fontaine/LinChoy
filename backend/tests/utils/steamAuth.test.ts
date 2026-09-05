import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  getSteamRedirectUrl,
  verifySteamOpenId,
} from "../../src/utils/linking/steamAuth.js";
const BACKEND_URL = process.env.BACKEND_URL as string;
function textResponse(body: string): Response {
  return { text: async () => body } as unknown as Response;
}

describe("Test utilitaire: getSteamRedirectUrl", () => {
  it("Construit une URL Steam OpenID valide avec les bons paramètres", () => {
    const url = getSteamRedirectUrl(
      `${BACKEND_URL}/steam/link/callback`,
      `${BACKEND_URL}`,
    );
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe(
      "https://steamcommunity.com/openid/login",
    );
    expect(parsed.searchParams.get("openid.mode")).toBe("checkid_setup");
    expect(parsed.searchParams.get("openid.return_to")).toBe(
      `${BACKEND_URL}/steam/link/callback`,
    );
    expect(parsed.searchParams.get("openid.realm")).toBe(`${BACKEND_URL}`);
    expect(parsed.searchParams.get("openid.ns")).toBe(
      "http://specs.openid.net/auth/2.0",
    );
  });
});

describe("Test utilitaire: verifySteamOpenId", () => {
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.fn<typeof fetch>();
    global.fetch = fetchMock;
  });

  it("Renvoie le SteamID si Steam confirme la signature", async () => {
    fetchMock.mockResolvedValue(
      textResponse("ns:http://specs.openid.net/auth/2.0\nis_valid:true\n"),
    );

    const steamId = await verifySteamOpenId({
      "openid.claimed_id":
        "https://steamcommunity.com/openid/id/76561198000000000",
    });

    expect(steamId).toBe("76561198000000000");
  });

  it("Rejette si Steam invalide la signature", async () => {
    fetchMock.mockResolvedValue(
      textResponse("ns:http://specs.openid.net/auth/2.0\nis_valid:false\n"),
    );

    await expect(
      verifySteamOpenId({
        "openid.claimed_id":
          "https://steamcommunity.com/openid/id/76561198000000000",
      }),
    ).rejects.toThrow("Signature Steam invalide");
  });

  it("Rejette si claimed_id est absent", async () => {
    fetchMock.mockResolvedValue(textResponse("is_valid:true"));

    await expect(verifySteamOpenId({})).rejects.toThrow();
  });

  it("Rejette si claimed_id ne correspond pas au format attendu", async () => {
    fetchMock.mockResolvedValue(textResponse("is_valid:true"));

    await expect(
      verifySteamOpenId({
        "openid.claimed_id": "https://exemple.com/pas-un-steamid",
      }),
    ).rejects.toThrow("Impossible d'extraire le SteamID");
  });
});
