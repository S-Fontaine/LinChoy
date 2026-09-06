import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const resolveMinecraftPlayerMock = jest.fn
  (input: string) => Promise<{ uuid: string; username: string }>
>();

jest.unstable_mockModule("../../../src/utils/linking/minecraftAuth.js", () => ({
  resolveMinecraftPlayer: resolveMinecraftPlayerMock,
}));

const { default: app } = await import("../../../src/app.js");
const { default: User } = await import("../../../src/models/User.js");
const { generateAccessToken } = await import("../../../src/utils/auth/jwt.js");
const request = (await import("supertest")).default;

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

describe("Test route: POST /minecraft/link", () => {
  beforeEach(() => {
    resolveMinecraftPlayerMock.mockReset();
  });

  it("Refuse la requête sans authentification", async () => {
    const res = await request(app)
      .post("/minecraft/link")
      .send({ input: "Notch" });
    expect(res.status).toBe(401);
  });

  it("Refuse un input vide", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .post("/minecraft/link")
      .set("Cookie", `accessToken=${token}`)
      .send({ input: "" });

    expect(res.status).toBe(400);
    expect(resolveMinecraftPlayerMock).not.toHaveBeenCalled();
  });

  it("Lie le compte Minecraft sans whitelister automatiquement nulle part", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    resolveMinecraftPlayerMock.mockResolvedValue({
      uuid: "uuid-1",
      username: "Notch",
    });

    const res = await request(app)
      .post("/minecraft/link")
      .set("Cookie", `accessToken=${token}`)
      .send({ input: "Notch" });

    expect(res.status).toBe(200);
    expect(res.body.minecraftUsername).toBe("Notch");
    expect(res.body.minecraftVerified).toBe(false);
    expect(res.body.minecraftLinkExpiresAt).toBeDefined();

    const updated = await User.findById(user._id);
    expect(updated?.minecraftUsername).toBe("Notch");
    expect(updated?.minecraftVerified).toBe(false);
  });

  it("Renvoie 404 si aucun joueur ne correspond", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    resolveMinecraftPlayerMock.mockRejectedValue(new Error("not_found"));

    const res = await request(app)
      .post("/minecraft/link")
      .set("Cookie", `accessToken=${token}`)
      .send({ input: "PseudoInexistant" });

    expect(res.status).toBe(404);
  });

  it("Renvoie 502 si Mojang est indisponible", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    resolveMinecraftPlayerMock.mockRejectedValue(
      new Error("mojang_unavailable"),
    );

    const res = await request(app)
      .post("/minecraft/link")
      .set("Cookie", `accessToken=${token}`)
      .send({ input: "Notch" });

    expect(res.status).toBe(502);
  });

  it("Refuse si ce compte Minecraft est déjà lié à un autre utilisateur", async () => {
    await User.create({
      username: "autreUser",
      email: "autre@linchoy.com",
      password: "MotDePasse123!",
      minecraftUuid: "uuid-1",
    });
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });
    resolveMinecraftPlayerMock.mockResolvedValue({
      uuid: "uuid-1",
      username: "Notch",
    });

    const res = await request(app)
      .post("/minecraft/link")
      .set("Cookie", `accessToken=${token}`)
      .send({ input: "Notch" });

    expect(res.status).toBe(409);
  });

  it("Autorise la re-liaison au même compte pour le même utilisateur", async () => {
    const user = await User.create({
      ...userPayload,
      minecraftUuid: "uuid-1",
      minecraftUsername: "Notch",
    });
    const token = generateAccessToken({ userId: user._id.toString() });
    resolveMinecraftPlayerMock.mockResolvedValue({
      uuid: "uuid-1",
      username: "Notch",
    });

    const res = await request(app)
      .post("/minecraft/link")
      .set("Cookie", `accessToken=${token}`)
      .send({ input: "Notch" });

    expect(res.status).toBe(200);
  });
});