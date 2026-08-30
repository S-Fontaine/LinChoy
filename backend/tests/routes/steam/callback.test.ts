import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const verifySteamOpenIdMock = jest.fn<() => Promise<string>>();

jest.unstable_mockModule("../../../src/utils/steamAuth.js", () => ({
  getSteamRedirectUrl: jest.fn<() => string>(),
  verifySteamOpenId: verifySteamOpenIdMock,
}));

const { default: app } = await import("../../../src/app.js");
const { default: User } = await import("../../../src/models/User.js");
const { generateAccessToken } = await import("../../../src/utils/jwt.js");
const request = (await import("supertest")).default;

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

describe("Test route: GET /steam/link/callback", () => {
  beforeEach(() => {
    verifySteamOpenIdMock.mockReset();
  });

  it("Lie le compte Steam et renvoie une page qui notifie le succès", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    verifySteamOpenIdMock.mockResolvedValue("76561198000000000");

    const res = await request(app)
      .get("/steam/link/callback")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html/);
    expect(res.text).toContain("window.opener.postMessage");
    expect(res.text).toContain('"type":"steam-link"');
    expect(res.text).toContain('"success":true');
    expect(res.text).toContain("76561198000000000");
    expect(res.text).toContain("window.close()");

    const updated = await User.findById(user._id);
    expect(updated?.steamId).toBe("76561198000000000");
  });

  it("Renvoie une erreur session_expired si aucun cookie n'est présent", async () => {
    const res = await request(app).get("/steam/link/callback");

    expect(res.status).toBe(200);
    expect(res.text).toContain('"success":false');
    expect(res.text).toContain('"error":"session_expired"');
    expect(verifySteamOpenIdMock).not.toHaveBeenCalled();
  });

  it("Renvoie une erreur session_expired si le cookie est invalide", async () => {
    const res = await request(app)
      .get("/steam/link/callback")
      .set("Cookie", "accessToken=token.invalide.bidon");

    expect(res.status).toBe(200);
    expect(res.text).toContain('"error":"session_expired"');
  });

  it("Renvoie already_linked si le SteamID appartient à un autre compte", async () => {
    const otherUser = await User.create({
      username: "autreUser",
      email: "autre@linchoy.com",
      password: "MotDePasse123!",
      steamId: "76561198000000000",
    });
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    verifySteamOpenIdMock.mockResolvedValue("76561198000000000");

    const res = await request(app)
      .get("/steam/link/callback")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain('"error":"already_linked"');

    const untouchedUser = await User.findById(user._id);
    expect(untouchedUser?.steamId).toBeNull();
    const untouchedOther = await User.findById(otherUser._id);
    expect(untouchedOther?.steamId).toBe("76561198000000000");
  });

  it("Autorise la re-liaison au même SteamID pour le même compte", async () => {
    const user = await User.create({
      ...userPayload,
      steamId: "76561198000000000",
    });
    const token = generateAccessToken({ userId: user._id.toString() });
    verifySteamOpenIdMock.mockResolvedValue("76561198000000000");

    const res = await request(app)
      .get("/steam/link/callback")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain('"success":true');
  });

  it("Renvoie l'erreur invalid si la vérification Steam échoue", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    verifySteamOpenIdMock.mockRejectedValue(new Error("Signature Steam invalide"));

    const res = await request(app)
      .get("/steam/link/callback")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain('"error":"invalid"');

    const untouched = await User.findById(user._id);
    expect(untouched?.steamId).toBeNull();
  });

  it("N'expose jamais l'origine du frontend à une valeur inattendue dans le script", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    verifySteamOpenIdMock.mockResolvedValue("76561198000000000");

    const res = await request(app)
      .get("/steam/link/callback")
      .set("Cookie", `accessToken=${token}`);

    expect(res.text).toContain(JSON.stringify(process.env.FRONTEND_URL));
  });
});