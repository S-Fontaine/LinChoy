"use client";
import styles from "./ServerStatus.module.css";
import { useAuth } from "@/context/AuthContext";
import { GameStatus } from "./GameStatus";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { type IGamesList } from "@/app/page";

interface IHome {
  gamesList: IGamesList[];
}

interface SingleGameData {
  result: boolean;
  data: {
    name: string;
    servername: string;
    totalPlayer: number;
    playerOnLine: number;
    players: string[];
    description: string;
    image: string;
    online: boolean;
    state: "offline" | "starting" | "online";
  };
}

export default function ServerStatus({ gamesList }: IHome) {
  const { user } = useAuth();
  const [gamesDataMap, setGamesDataMap] = useState<
    Record<string, SingleGameData>
  >({});

  useEffect(() => {
    if (!user || gamesList.length === 0) return;

    async function getData() {
      try {
        const newMap: Record<string, SingleGameData> = {};

        for (const game of gamesList) {
          const response = await fetchWithAuth(`/games/${game.slug}`, {
            method: "GET",
          });
          const resultData: SingleGameData = await response.json();
          newMap[game.slug] = resultData;
        }

        setGamesDataMap(newMap);
      } catch (err) {
        console.error("Erreur de récupération :", err);
      }
    }

    getData();
    const intervalId = setInterval(getData, 30000);
    return () => clearInterval(intervalId);
  }, [user, gamesList]);
  return (
    <main className={styles.mainContent}>
      <div className={styles.serverGrid}>
        {gamesList.map((game) => {
          const gameData = gamesDataMap[game.slug];

          if (!gameData) {
            return (
              <div key={game.slug} className={styles.cardSkeleton}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonLine} style={{ width: "60%" }} />
                <div className={styles.skeletonLine} style={{ width: "40%" }} />
              </div>
            );
          }

          return (
            <div key={game.slug} className={styles.cardWrapper}>
              <GameStatus
                state={gameData.data.state}
                isOnline={gameData.data.online}
                name={gameData.data.name}
                servername={gameData.data.servername}
                image={gameData.data.image}
                totalPlayer={gameData.data.totalPlayer}
                playerOnLine={gameData.data.playerOnLine}
                players={gameData.data.players}
                description={gameData.data.description}
              />
              {game.comingSoon && (
                <div className={styles.comingSoonOverlay}>
                  <span className={styles.comingSoonBadge}>
                    Bientôt disponible
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
