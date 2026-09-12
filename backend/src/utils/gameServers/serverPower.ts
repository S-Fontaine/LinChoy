import type { HydratedDocument } from "mongoose";
import type { IGameServer } from "../../models/GameServer.js";
import {
  restartContainer,
  emergencyRestartContainer,
  stopContainer,
  startContainer,
} from "./docker.js";
import { getProvider } from "../../games/index.js";

export type PowerAction =
  | "restart"
  | "quick-restart"
  | "emergency-restart"
  | "shutdown"
  | "start";

async function announce(
  server: HydratedDocument<IGameServer>,
  message: string,
): Promise<void> {
  try {
    await getProvider(server.gameData.slug)?.announce?.(server, message);
  } catch (err) {
    console.warn(`[power] Annonce échouée pour ${server.name} :`, err);
  }
}

async function save(server: HydratedDocument<IGameServer>): Promise<void> {
  try {
    await getProvider(server.gameData.slug)?.save?.(server);
  } catch (err) {
    console.warn(`[power] Sauvegarde échouée pour ${server.name} :`, err);
  }
}

function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function pluralSeconds(n: number): string {
  return `${n} seconde${n > 1 ? "s" : ""}`;
}

const runningActions = new Set<string>();

export function isPowerActionRunning(containerName: string): boolean {
  return runningActions.has(containerName);
}

export async function runPowerSequence(
  server: HydratedDocument<IGameServer>,
  action: PowerAction,
): Promise<void> {
  const { containerName } = server.gameData;
  const verb = action === "shutdown" ? "Extinction" : "Redémarrage";

  runningActions.add(containerName);
  try {
    if (action === "start") {
      await startContainer(containerName);
      return;
    }

    if (action === "emergency-restart" || action === "quick-restart") {
      await announce(server, `URGENT: ${verb} dans 30 secondes`);
      for (let i = 30; i >= 1; i--) {
        if (i === 30 || i === 20 || i <= 10) {
          await announce(server, `${verb} dans ${pluralSeconds(i)}`);
        }
        await wait(1);
      }
    } else {
      await announce(server, `${verb} dans 5 minutes`);
      await wait(240);
      await announce(server, `${verb} dans 1 minute`);
      await wait(30);
      await announce(server, `${verb} dans 30 secondes`);
      await wait(20);
      for (let i = 10; i >= 1; i--) {
        await announce(server, `${verb} dans ${pluralSeconds(i)}`);
        await wait(1);
      }
    }

    await announce(server, "Sauvegarde en cours...");
    await save(server);
    await wait(10);

    if (action === "shutdown") {
      await stopContainer(containerName);
    } else if (action === "emergency-restart") {
      await emergencyRestartContainer(containerName);
    } else {
      await restartContainer(containerName);
    }
  } catch (err) {
    console.error(`[power] Échec de la séquence ${action} pour ${server.name} :`, err);
  } finally {
    runningActions.delete(containerName);
  }
}
