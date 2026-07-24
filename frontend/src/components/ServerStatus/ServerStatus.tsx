"use client";
import styles from "./ServerStatus.module.css";
import { useAuth } from "@/context/AuthContext";
import { GameStatus } from "./GameStatus";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function Home() {
  const { user } = useAuth();
  const [gameData, setGameData] = useState({
    result: false,
    data: {
      name: "",
      description: "",
      servername: "",
      totalPlayer: 0,
      playerOnLine: 0,
    },
  });

  useEffect(() => {
    if (!user) return;

    async function getData() {
      try {
        const response = await fetchWithAuth("/game/palworld", {
          method: "GET",
        });
        const data = await response.json();
        if (data) {
          setGameData(data);
        }
      } catch (err) {
        console.error("Erreur de récupération :", err);
      }
    }

    getData();
    const intervalId = setInterval(getData, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <main className={styles.mainContent}>
      <section className={styles.server}>
        <GameStatus
          isOnline={gameData.result}
          name={gameData.data.name}
          servername={gameData.data.servername}
          image={`/assets/${gameData.data.name}.png`}
          totalPlayer={gameData.data.totalPlayer}
          playerOnLine={gameData.data.playerOnLine}
          description={gameData.data.description}
        />
      </section>
    </main>
  );
}
