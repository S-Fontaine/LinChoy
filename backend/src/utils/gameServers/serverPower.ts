import type { HydratedDocument } from "mongoose";
import type { IGameServer } from "../../models/GameServer.js";
import {
  restartContainer,
  emergencyRestartContainer,
  stopContainer,
} from "./docker.js";
import { runRconCommand } from "./rcon.js";

export type PowerAction = "restart" | "emergency-restart" | "shutdown";

const FETCH_TIMEOUT_MS = 5000;

function palworldApiUrl(server: HydratedDocument<IGameServer>, path: string): string {
  return `http://${server.hostInfo.address}:${server.hostInfo.port}/v1/api${path}`;
}

function palworldAuthHeader(server: HydratedDocument<IGameServer>): string {
  return (
    "Basic " + Buffer.from(`admin:${server.hostInfo.password}`).toString("base64")
  );
}

// Diffuse un message aux joueurs connectés. Best-effort : une annonce ratée ne
// doit jamais interrompre la séquence (sauvegarde puis extinction/redémarrage
// doivent avoir lieu même si le canal d'annonce est indisponible).
async function announce(
  server: HydratedDocument<IGameServer>,
  message: string,
): Promise<void> {
  try {
    const { type, containerName } = server.gameData;
    if (type === "palworld") {
      await fetch(palworldApiUrl(server, "/announce"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: palworldAuthHeader(server),
        },
        body: JSON.stringify({ message }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } else if (type === "minecraft") {
      await runRconCommand(
        server.hostInfo.address,
        String(server.hostInfo.port ?? ""),
        server.hostInfo.password,
        `say ${message}`,
      );
    } else if (containerName === "valheim-server") {
      await runRconCommand(
        server.hostInfo.address,
        String(server.hostInfo.port ?? ""),
        server.hostInfo.password,
        `say ${message}`,
      );
    } else if (containerName === "vrising-server") {
      await runRconCommand(
        server.hostInfo.address,
        String(server.hostInfo.port ?? ""),
        server.hostInfo.password,
        `announce ${message}`,
      );
    }
  } catch (err) {
    console.warn(`[power] Annonce échouée pour ${server.name} :`, err);
  }
}

// Sauvegarde best-effort avant extinction/redémarrage. Seuls Minecraft
// (save-all) et Palworld (REST /save) exposent une commande de sauvegarde
// connue — Valheim (ValheimRcon) et VRising n'en ont pas via RCON, leur monde
// se sauvegarde seul à intervalle régulier côté jeu.
async function save(server: HydratedDocument<IGameServer>): Promise<void> {
  try {
    const { type } = server.gameData;
    if (type === "palworld") {
      await fetch(palworldApiUrl(server, "/save"), {
        method: "POST",
        headers: { Authorization: palworldAuthHeader(server) },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } else if (type === "minecraft") {
      await runRconCommand(
        server.hostInfo.address,
        String(server.hostInfo.port ?? ""),
        server.hostInfo.password,
        "save-all",
      );
    }
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

// Reproduit le déroulé des scripts de maintenance existants : annonces
// échelonnées aux joueurs, sauvegarde, puis action Docker. Ne bloque jamais
// l'appelant plus que nécessaire : conçu pour être lancé sans await depuis la
// route (fire-and-forget), toutes les erreurs sont interceptées en interne.
export async function runPowerSequence(
  server: HydratedDocument<IGameServer>,
  action: PowerAction,
): Promise<void> {
  const { containerName } = server.gameData;
  const verb = action === "shutdown" ? "Extinction" : "Redémarrage";

  runningActions.add(containerName);
  try {
    if (action === "emergency-restart") {
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
