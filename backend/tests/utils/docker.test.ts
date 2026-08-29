import { jest, describe, it, expect, afterEach } from "@jest/globals";
import net from "net";

describe("Test utilitaire: isServerOnline (réel, sans mock)", () => {
  let server: net.Server;

  afterEach((done) => {
    if (server?.listening) {
      server.close(() => done());
    } else {
      done();
    }
  });

  it("Renvoie true si un service écoute sur le port", async () => {
    const { isServerOnline } = await import("../../src/utils/docker.js");

    server = net.createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as net.AddressInfo).port;

    const result = await isServerOnline("127.0.0.1", port);

    expect(result).toBe(true);
  });

  it("Renvoie false si rien n'écoute sur le port", async () => {
    const { isServerOnline } = await import("../../src/utils/docker.js");

    const result = await isServerOnline("127.0.0.1", 1, 500);

    expect(result).toBe(false);
  });
});

const inspectMock = jest.fn<() => Promise<unknown>>();
const getContainerMock = jest.fn<(containerName: string) => ({ inspect: typeof inspectMock })>();

jest.unstable_mockModule("dockerode", () => ({
  default: jest.fn().mockImplementation(() => ({
    getContainer: getContainerMock,
  })),
}));

const { getContainerState } = await import("../../src/utils/docker.js");

describe("Test utilitaire: getContainerState (dockerode mocké)", () => {
  it("Renvoie l'état du container quand il existe", async () => {
    getContainerMock.mockImplementation(() => ({ inspect: inspectMock }));
    inspectMock.mockResolvedValue({
      State: { Running: true, StartedAt: "2026-01-01T00:00:00Z" },
      HostConfig: { Memory: 512, NanoCpus: 1000000000 },
    });

    const state = await getContainerState("minecraft-server");

    expect(state.running).toBe(true);
    expect(state.startedAt).toBe("2026-01-01T00:00:00Z");
    expect(state.ram).toBe(512);
    expect(getContainerMock).toHaveBeenCalledWith("minecraft-server");
  });

  it("Propage l'erreur si le container n'existe pas", async () => {
    getContainerMock.mockImplementation(() => ({ inspect: inspectMock }));
    inspectMock.mockRejectedValue(new Error("no such container"));

    await expect(getContainerState("inexistant")).rejects.toThrow(
      "no such container",
    );
  });
});