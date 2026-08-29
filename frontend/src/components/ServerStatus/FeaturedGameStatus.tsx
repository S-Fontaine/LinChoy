"use client";
import styles from "./FeaturedGameStatus.module.css";
import Image from "next/image";
import { starFilled } from "../icons/Icons";

interface IFeaturedGame {
  state: "offline" | "starting" | "online";
  isOnline: boolean;
  name: string;
  servername: string;
  description: string;
  image: string;
  totalPlayer: number;
  playerOnLine: number;
  players: string[];
  onToggleFavorite: () => void;
}
export function FeaturedGameStatusSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonHeaderText}>
            <div
              className={styles.skeletonLine}
              style={{ width: "80px", height: "12px" }}
            />
            <div
              className={styles.skeletonLine}
              style={{ width: "220px", height: "24px" }}
            />
          </div>
          <div
            className={styles.skeletonLine}
            style={{ width: "24px", height: "24px", borderRadius: "50%" }}
          />
        </div>

        <div className={styles.skeletonStatusRow}>
          <div
            className={styles.skeletonLine}
            style={{ width: "100px", height: "16px" }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: "90px", height: "16px" }}
          />
        </div>

        <div
          className={styles.skeletonLine}
          style={{ width: "100%", height: "14px" }}
        />
        <div
          className={styles.skeletonLine}
          style={{ width: "70%", height: "14px" }}
        />

        <div className={styles.skeletonPlayersSection}>
          <div
            className={styles.skeletonLine}
            style={{ width: "120px", height: "12px" }}
          />
          <div className={styles.skeletonChips}>
            <div className={styles.skeletonChip} />
            <div className={styles.skeletonChip} />
            <div className={styles.skeletonChip} />
          </div>
        </div>
      </div>
    </div>
  );
}
export function FeaturedGameStatus(game: IFeaturedGame) {
  const statusLabel =
    game.state === "online"
      ? "En ligne"
      : game.state === "starting"
        ? "Démarrage..."
        : "Hors ligne";

  return (
    <div className={`${styles.card} ${styles[game.state]}`}>
      <div className={styles.imageContainer}>
        <Image
          className={`${styles.image} ${game.isOnline ? styles.imageOn : styles.imageOff}`}
          src={game.image}
          alt={game.name}
          sizes="(max-width: 900px) 100vw, 480px"
          fill
        />
        <span className={styles.favoriteTag}>
          {starFilled}
          Favori
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <p className={styles.gameLabel}>{game.name}</p>
            <h2 className={styles.serverName}>{game.servername}</h2>
          </div>
          <button
            className={styles.unfavoriteBtn}
            onClick={game.onToggleFavorite}
            aria-label="Retirer des favoris"
          >
            {starFilled}
          </button>
        </div>

        <div className={styles.statusRow}>
          <div className={styles.statusContainer}>
            <div
              className={`${styles.statusIndicator} ${styles[game.state]}`}
            />
            <p className={styles.statusLabel}>{statusLabel}</p>
          </div>
          <p className={styles.playerCount}>
            {game.playerOnLine} / {game.totalPlayer} joueurs
          </p>
        </div>

        <p className={styles.description}>{game.description}</p>

        <div className={styles.playersSection}>
          <p className={styles.playersTitle}>Joueurs en ligne</p>
          {game.players.length > 0 ? (
            <ul className={styles.playersList}>
              {game.players.map((player) => (
                <li key={player} className={styles.playerChip}>
                  {player}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noPlayers}>Personne pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
}
