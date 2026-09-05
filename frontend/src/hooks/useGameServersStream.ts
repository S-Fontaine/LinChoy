"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface SingleGameData {
  result: boolean;
  data: {
    state: "offline" | "starting" | "online";
    online: boolean;
    name: string;
    servername: string;
    description: string;
    image: string;
    totalPlayer: number;
    playerOnLine: number;
    players: string[];
  };
}

export function useGameServersStream() {
  const { user } = useAuth();
  const [gamesDataMap, setGamesDataMap] = useState<
    Record<string, SingleGameData>
  >({});

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(`${BACKEND_URL}/games/stream`);

    eventSource.onmessage = (event) => {
      try {
        const serverData = JSON.parse(event.data);
        setGamesDataMap((prev) => ({
          ...prev,
          [serverData.slug]: {
            result: true,
            data: {
              state: serverData.state,
              online: serverData.online,
              name: serverData.name,
              servername: serverData.servername,
              description: serverData.description,
              image: serverData.image,
              totalPlayer: serverData.totalPlayer,
              playerOnLine: serverData.playerOnLine,
              players: serverData.players ?? [],
            },
          },
        }));
      } catch (err) {
        console.error("[SSE] Erreur parsing données :", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  return { gamesDataMap };
}
