import net from "net";
import Docker from "dockerode";

const docker = new Docker();

function isServerOnline(
  host: string,
  port: number,
  timeout = 3000,
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.connect(port, host, () => {
      socket.destroy();
      resolve(true); // Port répond = serveur en ligne
    });

    socket.on("error", () => resolve(false));
    socket.on("timeout", () => resolve(false));
  });
}

const online = await isServerOnline("localhost", 8211);

interface ContainerStatus {
  running: boolean;
  startedAt: string;
  ram: number | undefined;
  cpu: number | undefined;
}

async function getServerStatus(
  containerName: string,
): Promise<ContainerStatus> {
  const container = docker.getContainer(containerName);
  const info = await container.inspect();

  return {
    running: info.State.Running,
    startedAt: info.State.StartedAt,
    ram: info.HostConfig.Memory,
    cpu: info.HostConfig.NanoCpus,
  };
}

const status = await getServerStatus("palworld");

interface PalworldServerInfo {
  players: number;
  maxplayers: number;
  days: number;
  version: string;
}

type PalworldStatus =
  | { status: "offline" }
  | { status: "starting" }
  | {
      status: "online";
      players: number;
      maxPlayers: number;
      day: number;
      version: string;
    };

async function getContainerState(
  containerName: string,
): Promise<ContainerStatus> {
  return getServerStatus(containerName);
}

async function getPalworldStatus(): Promise<PalworldStatus> {
  const container = await getContainerState("palworld");
  if (!container.running) {
    return { status: "offline" };
  }

  try {
    const response = await fetch("http://localhost:8212/v1/api/server/info");
    const data = (await response.json()) as PalworldServerInfo;

    return {
      status: "online",
      players: data.players,
      maxPlayers: data.maxplayers,
      day: data.days,
      version: data.version,
    };
  } catch {
    return { status: "starting" };
  }
}
