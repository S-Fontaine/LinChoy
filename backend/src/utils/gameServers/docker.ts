import net from "net";
import Docker from "dockerode";

const docker = new Docker({
  host: process.env.DOCKER_PROXY_HOST || "localhost",
  port: Number(process.env.DOCKER_PROXY_PORT) || 2375,
});

interface ContainerStatus {
  running: boolean;
  startedAt: string;
  ram: number | undefined;
  cpu: number | undefined;
}

export function isServerOnline(
  host: string,
  port: number,
  timeout = 3000,
): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.connect(port, host, () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export async function getContainerState(
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

const POWER_FETCH_TIMEOUT_MS = 10000;

async function powerRequest(path: string): Promise<void> {
  const url = `http://${process.env.DOCKER_POWER_PROXY_HOST}:${process.env.DOCKER_POWER_PROXY_PORT}${path}`;
  const res = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(POWER_FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`docker-power-proxy a répondu ${res.status} pour ${path}`);
  }
}

export async function restartContainer(containerName: string): Promise<void> {
  await powerRequest(`/containers/${containerName}/restart`);
}

export async function emergencyRestartContainer(
  containerName: string,
): Promise<void> {
  await powerRequest(`/containers/${containerName}/restart?t=0`);
}

export async function stopContainer(containerName: string): Promise<void> {
  await powerRequest(`/containers/${containerName}/stop`);
}

export async function startContainer(containerName: string): Promise<void> {
  await powerRequest(`/containers/${containerName}/start`);
}
