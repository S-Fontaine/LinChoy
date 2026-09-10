import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { HydratedDocument } from "mongoose";
import GameServer, { type IGameServer } from "../../src/models/GameServer.js";

const runRconCommandMock =
  jest.fn<
    (host: string, port: string, password: string, command: string) => Promise<void>
  >();

jest.unstable_mockModule("../../src/utils/gameServers/rcon.js", () => ({
  runRconCommand: runRconCommandMock,
}));

const restartContainerMock = jest.fn<(containerName: string) => Promise<void>>();
const emergencyRestartContainerMock =
  jest.fn<(containerName: string) => Promise<void>>();
const stopContainerMock = jest.fn<(containerName: string) => Promise<void>>();

jest.unstable_mockModule("../../src/utils/gameServers/docker.js", () => ({
  restartContainer: restartContainerMock,
  emergencyRestartContainer: emergencyRestartContainerMock,
  stopContainer: stopContainerMock,
  getContainerState: jest.fn(),
  isServerOnline: jest.fn(),
}));

const { runPowerSequence, isPowerActionRunning } = await import(
  "../../src/utils/gameServers/serverPower.js"
);

const fetchMock = jest.fn<typeof fetch>();
global.fetch = fetchMock as unknown as typeof fetch;

beforeEach(() => {
  runRconCommandMock.mockReset().mockResolvedValue(undefined);
  restartContainerMock.mockReset().mockResolvedValue(undefined);
  emergencyRestartContainerMock.mockReset().mockResolvedValue(undefined);
  stopContainerMock.mockReset().mockResolvedValue(undefined);
  fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
  process.env.MINECRAFT_RCON_HOST = "mc-host";
  process.env.MINECRAFT_RCON_PORT = "25575";
  process.env.MINECRAFT_RCON_PASSWORD = "mc-pass";
  process.env.VALHEIM_RCON_HOST = "valheim-host";
  process.env.VALHEIM_RCON_PORT = "2458";
  process.env.VALHEIM_RCON_PASSWORD = "valheim-pass";
  process.env.VRISING_RCON_HOST = "vrising-host";
  process.env.VRISING_RCON_PORT = "25575";
  process.env.VRISING_RCON_PASSWORD = "vrising-pass";
  process.env.PALWORLD_ADMIN = "admin:pal-pass";
  process.env.PALWORLD_API_ADDRESS = "pal-host";
  process.env.PALWORLD_API_PORT = "8212";
});

function countCalls(mock: jest.Mock, urlFragment: string): number {
  return mock.mock.calls.filter((call) => String(call[0]).includes(urlFragment))
    .length;
}

// N'active les fake timers qu'autour de l'appel lui-même : MongoMemoryServer
// (créer/lire le GameServer) dépend de vrais timers, les fausser plus tôt fait
// pendre les requêtes Mongoose.
async function runSequence(
  server: HydratedDocument<IGameServer>,
  action: "restart" | "emergency-restart" | "shutdown",
  advanceMs: number,
) {
  jest.useFakeTimers();
  try {
    const promise = runPowerSequence(server, action);
    await jest.advanceTimersByTimeAsync(advanceMs);
    await promise;
  } finally {
    jest.useRealTimers();
  }
}

describe("runPowerSequence", () => {
  it("Redémarrage normal Palworld : 14 annonces, 1 sauvegarde, puis restart", async () => {
    const server = await GameServer.create({
      name: "Palworld",
      gameData: { slug: "palworld", type: "palworld", containerName: "palworld-server" },
    });

    await runSequence(server, "restart", 6 * 60 * 1000);

    expect(countCalls(fetchMock, "/announce")).toBe(14);
    expect(countCalls(fetchMock, "/save")).toBe(1);
    expect(restartContainerMock).toHaveBeenCalledWith("palworld-server");
    expect(stopContainerMock).not.toHaveBeenCalled();
  });

  it("Redémarrage d'urgence Palworld : 14 annonces sur 30 secondes puis restart d'urgence", async () => {
    const server = await GameServer.create({
      name: "Palworld",
      gameData: { slug: "palworld", type: "palworld", containerName: "palworld-server" },
    });

    await runSequence(server, "emergency-restart", 60 * 1000);

    expect(countCalls(fetchMock, "/announce")).toBe(14);
    expect(emergencyRestartContainerMock).toHaveBeenCalledWith("palworld-server");
    expect(restartContainerMock).not.toHaveBeenCalled();
  });

  it("Extinction Palworld : même échéancier que le redémarrage mais stop() au lieu de restart()", async () => {
    const server = await GameServer.create({
      name: "Palworld",
      gameData: { slug: "palworld", type: "palworld", containerName: "palworld-server" },
    });

    await runSequence(server, "shutdown", 6 * 60 * 1000);

    expect(countCalls(fetchMock, "/announce")).toBe(14);
    expect(stopContainerMock).toHaveBeenCalledWith("palworld-server");
    expect(restartContainerMock).not.toHaveBeenCalled();
  });

  it("Minecraft : annonce via RCON 'say' et sauvegarde via 'save-all'", async () => {
    const server = await GameServer.create({
      name: "Minecraft",
      gameData: { slug: "minecraft-hard", type: "minecraft", containerName: "mc-server" },
    });

    await runSequence(server, "restart", 6 * 60 * 1000);

    const commands = runRconCommandMock.mock.calls.map((call) => call[3]);
    expect(commands.filter((c) => c.startsWith("say ")).length).toBe(14);
    expect(commands.filter((c) => c === "save-all").length).toBe(1);
    expect(restartContainerMock).toHaveBeenCalledWith("mc-server");
  });

  it("Valheim : annonce via RCON 'say', pas de sauvegarde (non supportée)", async () => {
    const server = await GameServer.create({
      name: "Valheim",
      gameData: { slug: "valheim", type: "protocol-valve", containerName: "valheim-server" },
    });

    await runSequence(server, "restart", 6 * 60 * 1000);

    expect(runRconCommandMock).toHaveBeenCalledTimes(14);
    const commands = runRconCommandMock.mock.calls.map((call) => call[3]);
    expect(commands.every((c) => c.startsWith("say "))).toBe(true);
    expect(restartContainerMock).toHaveBeenCalledWith("valheim-server");
  });

  it("VRising : annonce via RCON 'announce', pas de sauvegarde (non supportée)", async () => {
    const server = await GameServer.create({
      name: "VRising",
      gameData: { slug: "vrising", type: "protocol-valve", containerName: "vrising-server" },
    });

    await runSequence(server, "restart", 6 * 60 * 1000);

    expect(runRconCommandMock).toHaveBeenCalledTimes(14);
    const commands = runRconCommandMock.mock.calls.map((call) => call[3]);
    expect(commands.every((c) => c.startsWith("announce "))).toBe(true);
    expect(restartContainerMock).toHaveBeenCalledWith("vrising-server");
  });

  it("isPowerActionRunning reflète l'état pendant puis après la séquence", async () => {
    const server = await GameServer.create({
      name: "Palworld",
      gameData: { slug: "palworld", type: "palworld", containerName: "palworld-server" },
    });

    expect(isPowerActionRunning("palworld-server")).toBe(false);

    jest.useFakeTimers();
    try {
      const promise = runPowerSequence(server, "restart");
      expect(isPowerActionRunning("palworld-server")).toBe(true);
      await jest.advanceTimersByTimeAsync(6 * 60 * 1000);
      await promise;
    } finally {
      jest.useRealTimers();
    }

    expect(isPowerActionRunning("palworld-server")).toBe(false);
  });

  it("Une annonce en échec n'empêche pas la sauvegarde et le restart", async () => {
    const server = await GameServer.create({
      name: "Palworld",
      gameData: { slug: "palworld", type: "palworld", containerName: "palworld-server" },
    });
    fetchMock.mockRejectedValue(new Error("network down"));

    await runSequence(server, "restart", 6 * 60 * 1000);

    expect(restartContainerMock).toHaveBeenCalledWith("palworld-server");
  });
});
