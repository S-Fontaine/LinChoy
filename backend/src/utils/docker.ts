import net from "net";
import Docker from "dockerode";

const docker = new Docker();

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

// async function getServerStatus(
//   containerName: string,
// ): Promise<ContainerStatus> {
//   const container = docker.getContainer(containerName);
//   const info = await container.inspect();

//   return {
//     running: info.State.Running,
//     startedAt: info.State.StartedAt,
//     ram: info.HostConfig.Memory,
//     cpu: info.HostConfig.NanoCpus,
//   };
// }

// async function getContainerState(
//   containerName: string,
// ): Promise<ContainerStatus> {
//   return getServerStatus(containerName);
// }

// async function getPalworldStatus() {
//   const container = await getContainerState("palworld");
//   if (!container.running) {
//     return { status: "offline" };
//   }
//   try {
//   } catch {
//     return { status: "starting" };
//   }
// }
