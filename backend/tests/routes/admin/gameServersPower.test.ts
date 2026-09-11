import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import type { HydratedDocument } from "mongoose";
import GameServer, { type IGameServer } from "../../../src/models/GameServer.js";
import { generateAccessToken } from "../../../src/utils/auth/jwt.js";
import type { PowerAction } from "../../../src/utils/gameServers/serverPower.js";

const runPowerSequenceMock =
  jest.fn<
    (server: HydratedDocument<IGameServer>, action: PowerAction) => Promise<void>
  >();
const isPowerActionRunningMock = jest.fn<(containerName: string) => boolean>();

jest.unstable_mockModule("../../../src/utils/gameServers/serverPower.js", () => ({
  runPowerSequence: runPowerSequenceMock,
  isPowerActionRunning: isPowerActionRunningMock,
}));

const { default: app } = await import("../../../src/app.js");

const payload = {
  name: "Minecraft",
  gameData: {
    slug: "minecraft",
    type: "minecraft" as const,
    containerName: "minecraft-server",
  },
};

function adminToken() {
  return generateAccessToken({ userId: "64f1a2b3c4d5e6f7a8b9c0d1", role: "admin" });
}

beforeEach(() => {
  runPowerSequenceMock.mockReset().mockResolvedValue(undefined);
  isPowerActionRunningMock.mockReset().mockReturnValue(false);
});

describe("Routes /admin/game-servers/:id/(restart|emergency-restart|shutdown)", () => {
  it("Programme un redémarrage et répond 202 sans attendre la séquence", async () => {
    const server = await GameServer.create(payload);
    const res = await request(app)
      .post(`/admin/game-servers/${server._id}/restart`)
      .set("Cookie", `accessToken=${adminToken()}`);

    expect(res.status).toBe(202);
    expect(runPowerSequenceMock).toHaveBeenCalledTimes(1);
    expect(runPowerSequenceMock.mock.calls[0]![1]).toBe("restart");
  });

  it("Programme un redémarrage rapide", async () => {
    const server = await GameServer.create(payload);
    const res = await request(app)
      .post(`/admin/game-servers/${server._id}/quick-restart`)
      .set("Cookie", `accessToken=${adminToken()}`);

    expect(res.status).toBe(202);
    expect(runPowerSequenceMock.mock.calls[0]![1]).toBe("quick-restart");
  });

  it("Programme un démarrage", async () => {
    const server = await GameServer.create(payload);
    const res = await request(app)
      .post(`/admin/game-servers/${server._id}/start`)
      .set("Cookie", `accessToken=${adminToken()}`);

    expect(res.status).toBe(202);
    expect(runPowerSequenceMock.mock.calls[0]![1]).toBe("start");
  });

  it("Programme un redémarrage d'urgence", async () => {
    const server = await GameServer.create(payload);
    const res = await request(app)
      .post(`/admin/game-servers/${server._id}/emergency-restart`)
      .set("Cookie", `accessToken=${adminToken()}`);

    expect(res.status).toBe(202);
    expect(runPowerSequenceMock.mock.calls[0]![1]).toBe("emergency-restart");
  });

  it("Programme une extinction", async () => {
    const server = await GameServer.create(payload);
    const res = await request(app)
      .post(`/admin/game-servers/${server._id}/shutdown`)
      .set("Cookie", `accessToken=${adminToken()}`);

    expect(res.status).toBe(202);
    expect(runPowerSequenceMock.mock.calls[0]![1]).toBe("shutdown");
  });

  it("Renvoie 404 pour un serveur inexistant", async () => {
    const res = await request(app)
      .post("/admin/game-servers/64f1a2b3c4d5e6f7a8b9c0d1/restart")
      .set("Cookie", `accessToken=${adminToken()}`);

    expect(res.status).toBe(404);
    expect(runPowerSequenceMock).not.toHaveBeenCalled();
  });

  it("Renvoie 404 sans authentification admin", async () => {
    const server = await GameServer.create(payload);
    const res = await request(app).post(
      `/admin/game-servers/${server._id}/shutdown`,
    );

    expect(res.status).toBe(404);
    expect(runPowerSequenceMock).not.toHaveBeenCalled();
  });

  it("Renvoie 409 si une action est déjà en cours sur ce serveur", async () => {
    const server = await GameServer.create(payload);
    isPowerActionRunningMock.mockReturnValue(true);

    const res = await request(app)
      .post(`/admin/game-servers/${server._id}/restart`)
      .set("Cookie", `accessToken=${adminToken()}`);

    expect(res.status).toBe(409);
    expect(runPowerSequenceMock).not.toHaveBeenCalled();
  });
});
