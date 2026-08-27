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
    description: string;
    image: string;
    online: boolean;
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
      {gamesList.map((game) => {
        const gameData = gamesDataMap[game.slug];
        if (!gameData)
          return <div key={game.slug}>Chargement de {game.name}...</div>;

        return (
          <section className={styles.server} key={game.slug}>
            <GameStatus
              isOnline={gameData.data.online}
              name={gameData.data.name}
              servername={gameData.data.servername}
              image={gameData.data.image}
              totalPlayer={gameData.data.totalPlayer}
              playerOnLine={gameData.data.playerOnLine}
              description={gameData.data.description}
            />
          </section>
        );
      })}
    </main>
  );
}
