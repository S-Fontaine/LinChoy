import styles from "./GameStatus.module.css";
import Image from "next/image";

interface IGame {
  isOnline: boolean;
  name: string;
  servername: string;
  description: string;
  image: string;
  totalPlayer: number;
  playerOnLine: number;
}

export function GameStatus(game: IGame) {
  const isServerOn = game.isOnline;

  return (
    <div className={`${styles.card} ${isServerOn && styles.isOn}`}>
      <div className={styles.game}>
        <h2 className={styles.gameTitle}>{game.name}</h2>
        <div className={styles.statusContainer}>
          <p className={styles.isOnline}>
            {isServerOn ? "En ligne" : "Hors ligne"}
          </p>
          <div
            className={`${styles.statusIndicator} ${isServerOn && styles.isOn}`}
          ></div>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <Image
          className={`${styles.image} ${isServerOn ? styles.imageOn : styles.imageOff}`}
          src={game.image}
          alt={game.name}
          sizes="(max-width: 600px) 100vw, 580px"
          fill
        />
      </div>
      <div className={styles.contentSection}>
        <div className={styles.serverHeader}>
          <h3 className={styles.serverName}>{game.servername}</h3>
          <div className={styles.playerBadge}>
            {game.playerOnLine} / {game.totalPlayer} joueurs
          </div>
        </div>
        <p className={styles.serverDescription}>{game.description}</p>
      </div>
    </div>
  );
}
