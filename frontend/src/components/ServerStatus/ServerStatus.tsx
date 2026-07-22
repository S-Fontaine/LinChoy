"use client";
import styles from "./ServerStatus.module.css";

import { GameStatus } from "./GameStatus";

const game = {
  name: "Palworld",
  image: "/assets/palworld.png",
  totalPlayer: 10,
  playerOnLine: 2,
  serverType: "PVE Survie",
};

export default function Home() {
  return (
    <main className={styles.mainContent}>
      <section className={styles.server}>
        <GameStatus
          name={game.name}
          image={game.image}
          totalPlayer={game.totalPlayer}
          playerOnLine={game.playerOnLine}
          serverType={game.serverType}
        />
        <GameStatus
          name={game.name}
          image={game.image}
          totalPlayer={game.totalPlayer}
          playerOnLine={game.playerOnLine}
          serverType={game.serverType}
        />
      </section>
    </main>
  );
}
