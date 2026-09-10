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

// Redémarrage propre : laisse au serveur le délai par défaut de Docker pour
// s'arrêter proprement (sauvegarde en cours, joueurs prévenus, etc.) avant le kill.
export async function restartContainer(containerName: string): Promise<void> {
  const container = docker.getContainer(containerName);
  await container.restart();
}

// Redémarrage d'urgence : aucun délai de grâce, le serveur est tué immédiatement
// puis relancé — à utiliser seulement si le serveur ne répond plus.
export async function emergencyRestartContainer(
  containerName: string,
): Promise<void> {
  const container = docker.getContainer(containerName);
  await container.restart({ t: 0 });
}

// Extinction : arrêt propre, le conteneur reste arrêté (pas de redémarrage
// automatique sauf politique de restart configurée sur le conteneur lui-même).
export async function stopContainer(containerName: string): Promise<void> {
  const container = docker.getContainer(containerName);
  await container.stop();
}
