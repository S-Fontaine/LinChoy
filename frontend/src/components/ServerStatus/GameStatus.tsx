import styles from "./GameStatus.module.css";
import Image from "next/image";
import { useState } from "react";

interface IGame {
  name: string;
  image: string;
  totalPlayer: number;
  playerOnLine: number;
  serverType: string;
}

export function GameStatus(game: IGame) {
  const [isServerOn, setIsServerOn] = useState<boolean>(true);
  const togglePower = () => setIsServerOn((prev) => !prev);

  return (
    <div className={`${styles.card} ${isServerOn && styles.isOn}`}>
      <div className={styles.game}>
        <h2>{game.name}</h2>
        <div
          className={`${styles.statusIndicator} ${isServerOn && styles.isOn}`}
          onClick={togglePower}
        ></div>
      </div>
      <div className={styles.imageContainer}>
        <Image
          className={styles.image}
          src={game.image}
          alt={game.name}
          fill
        />
      </div>
      <div className={styles.serverInfo}>
        <ul>
          <li>Nombre de Joueur : {game.totalPlayer}</li>
          <li>Joueur en Ligne : {game.playerOnLine}</li>
          <li>Serveur : {game.serverType}</li>
        </ul>
      </div>
    </div>
  );
}
