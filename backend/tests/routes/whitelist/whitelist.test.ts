import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const revokeAllWhitelistsForUserMock = jest.fn<() => Promise<void>>();
const addToWhitelistMock =
  jest.fn<
    (target: {
      type: string;
      containerName: string;
      identifier: string;
    }) => Promise<void>
  >();

jest.unstable_mockModule("../../../src/utils/linking/gameWhitelist.js", () => ({
  addToWhitelist: addToWhitelistMock,
  revokeAllWhitelistsForUser: revokeAllWhitelistsForUserMock,
}));

const { default: app } = await import("../../../src/app.js");
const { default: User } = await import("../../../src/models/User.js");
const { default: GameServer } =
  await import("../../../src/models/GameServer.js");
const { default: ServerWhitelist } =
  await import("../../../src/models/ServerWhitelist.js");
const { generateAccessToken } = await import("../../../src/utils/auth/jwt.js");
const request = (await import("supertest")).default;

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

describe("Test route: POST /games/:slug/whitelist", () => {
  beforeEach(() => {
    addToWhitelistMock.mockReset();
    addToWhitelistMock.mockResolvedValue(undefined);
    revokeAllWhitelistsForUserMock.mockReset();
    revokeAllWhitelistsForUserMock.mockResolvedValue(undefined);
  });

  it("Refuse la requête sans authentification", async () => {
    const res = await request(app).post("/games/minecraft/whitelist");
    expect(res.status).toBe(401);
  });

  it("Renvoie 404 pour un serveur inexistant", async () => {
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .post("/games/inexistant/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(404);
  });

  it("Refuse avec linkRequired si le compte requis n'est pas lié", async () => {
    await GameServer.create({
      name: "Minecraft",
      slug: "minecraft",
      type: "minecraft",
      containerName: "mc-server",
    });
    const user = await User.create(userPayload);
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .post("/games/minecraft/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(400);
    expect(res.body.linkRequired).toBe(true);
    expect(addToWhitelistMock).not.toHaveBeenCalled();
  });

  it("Whiteliste et renvoie les infos de connexion (Minecraft)", async () => {
    const server = await GameServer.create({
      name: "Minecraft",
      slug: "minecraft",
      type: "minecraft",
      containerName: "mc-server",
      address: "play.linchoy.com",
      port: 25565,
    });
    const user = await User.create({
      ...userPayload,
      minecraftUsername: "Notch",
      minecraftUuid: "uuid-1",
    });
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .post("/games/minecraft/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.connection).toEqual({
      address: "play.linchoy.com",
      port: 25565,
    });
    expect(addToWhitelistMock).toHaveBeenCalledWith({
      type: "minecraft",
      containerName: "mc-server",
      identifier: "Notch",
    });

    const entry = await ServerWhitelist.findOne({
      user: user._id,
      gameServer: server._id,
    });
    expect(entry).not.toBeNull();
  });

  it("Whiteliste avec le steamId pour un jeu Steam", async () => {
    await GameServer.create({
      name: "V Rising",
      slug: "vrising",
      type: "protocol-valve",
      containerName: "vrising-server",
    });
    const user = await User.create({
      ...userPayload,
      steamId: "76561198000000000",
    });
    const token = generateAccessToken({ userId: user._id.toString() });

    const res = await request(app)
      .post("/games/vrising/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(addToWhitelistMock).toHaveBeenCalledWith({
      type: "protocol-valve",
      containerName: "vrising-server",
      identifier: "76561198000000000",
    });
  });

  it("Est idempotent : n'appelle pas addToWhitelist une seconde fois si déjà whitelisté", async () => {
    const server = await GameServer.create({
      name: "Minecraft",
      slug: "minecraft",
      type: "minecraft",
      containerName: "mc-server",
    });
    const user = await User.create({
      ...userPayload,
      minecraftUsername: "Notch",
      minecraftUuid: "uuid-1",
    });
    const token = generateAccessToken({ userId: user._id.toString() });
    await ServerWhitelist.create({ user: user._id, gameServer: server._id });

    const res = await request(app)
      .post("/games/minecraft/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(addToWhitelistMock).not.toHaveBeenCalled();

    const entries = await ServerWhitelist.find({
      user: user._id,
      gameServer: server._id,
    });
    expect(entries).toHaveLength(1);
  });
});
