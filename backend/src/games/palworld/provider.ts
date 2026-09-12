import { palworldApiUrl, palworldAuthHeader } from "./api.js";
import type { GameProvider } from "../types.js";

const FETCH_TIMEOUT_MS = 5000;

export const palworldProvider: GameProvider = {
  async announce(server, message) {
    await fetch(palworldApiUrl(server, "/announce"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: palworldAuthHeader(server),
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  },

  async save(server) {
    await fetch(palworldApiUrl(server, "/save"), {
      method: "POST",
      headers: { Authorization: palworldAuthHeader(server) },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  },
};
