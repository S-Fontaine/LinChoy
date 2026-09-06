import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/models/User.js";
import GameServer from "../../../src/models/GameServer.js";
import ServerWhitelist from "../../../src/models/ServerWhitelist.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";

const userPayload = {
  username: "linchoyTest",
  email: "fake@linchoy.com",
  password: "MotDePasse123!",
};

async function createAuthedUser(overrides: Record<string, unknown> = {}) {
  const user = await User.create({ ...userPayload, ...overrides });
  const token = generateAccessToken({ userId: user._id.toString() });
  return { user, token };
}

describe("Test route: GET /games/:slug/whitelist", () => {
  it("Refuse la requête sans authentification", async () => {
    const res = await request(app).get("/games/minecraft/whitelist");
    expect(res.status).toBe(401);
  });

  it("Renvoie 404 pour un serveur inexistant", async () => {
    const { token } = await createAuthedUser();

    const res = await request(app)
      .get("/games/inexistant/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(404);
  });

  it("Indique linked:false si le compte Minecraft n'est pas lié", async () => {
    await GameServer.create({
      name: "Minecraft",
      gameData: {
        slug: "minecraft",
        type: "minecraft",
        containerName: "mc-server",
      },
    });
    const { token } = await createAuthedUser();

    const res = await request(app)
      .get("/games/minecraft/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      result: true,
      linked: false,
      whitelisted: false,
      connection: null,
    });
  });

  it("Indique linked:false si le compte Steam n'est pas lié (jeu Steam)", async () => {
    await GameServer.create({
      name: "V Rising",
      gameData: {
        slug: "vrising",
        type: "protocol-valve",
        containerName: "vrising-server",
      },
    });
    const { token } = await createAuthedUser();

    const res = await request(app)
      .get("/games/vrising/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.body).toMatchObject({ linked: false, whitelisted: false });
  });

  it("Indique linked:true whitelisted:false si le compte est lié mais pas encore whitelisté", async () => {
    await GameServer.create({
      name: "Minecraft",
      gameData: {
        slug: "minecraft",
        type: "minecraft",
        containerName: "mc-server",
      },
    });
    const { token } = await createAuthedUser({
      minecraftUsername: "Notch",
      minecraftUuid: "uuid-1",
    });

    const res = await request(app)
      .get("/games/minecraft/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.body).toMatchObject({
      linked: true,
      whitelisted: false,
      connection: null,
    });
  });

  it("Renvoie whitelisted:true et les infos de connexion si une entrée existe", async () => {
    const server = await GameServer.create({
      name: "Minecraft",
      gameData: {
        slug: "minecraft",
        type: "minecraft",
        containerName: "mc-server",
      },
      connectionInfo: { address: "play.linchoy.com", port: 25565 },
    });
    const { user, token } = await createAuthedUser({
      minecraftUsername: "Notch",
      minecraftUuid: "uuid-1",
    });
    await ServerWhitelist.create({ user: user._id, gameServer: server._id });

    const res = await request(app)
      .get("/games/minecraft/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.body).toMatchObject({
      linked: true,
      whitelisted: true,
      connection: { address: "play.linchoy.com", port: 25565 },
    });
  });

  it("Utilise le steamId (pas le pseudo Minecraft) pour un serveur Steam", async () => {
    const server = await GameServer.create({
      name: "Palworld",
      gameData: {
        slug: "palworld",
        type: "palworld",
        containerName: "pal-server",
      },
      connectionInfo: { address: "play.linchoy.com", port: 8211 },
    });
    const { user, token } = await createAuthedUser({
      steamId: "76561198000000000",
    });
    await ServerWhitelist.create({ user: user._id, gameServer: server._id });

    const res = await request(app)
      .get("/games/palworld/whitelist")
      .set("Cookie", `accessToken=${token}`);

    expect(res.body).toMatchObject({ linked: true, whitelisted: true });
  });
});
