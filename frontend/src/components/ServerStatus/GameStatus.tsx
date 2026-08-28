"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./GameStatus.module.css";
import Image from "next/image";

interface IGame {
  state: "offline" | "starting" | "online";
  isOnline: boolean;
  name: string;
  servername: string;
  description: string;
  image: string;
  totalPlayer: number;
  playerOnLine: number;
  players: string[];
}

export function GameStatus(game: IGame) {
  const isServerOn = game.isOnline;
  const hasOnlinePlayers = game.playerOnLine > 0 && game.players.length > 0;
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const statusLabel =
    game.state === "online"
      ? "En ligne"
      : game.state === "starting"
        ? "Démarrage..."
        : "Hors ligne";

  useEffect(() => {
    if (!isTooltipOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        badgeRef.current &&
        !badgeRef.current.contains(event.target as Node)
      ) {
        setIsTooltipOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isTooltipOpen]);

  return (
    <div className={`${styles.card} ${styles[game.state]}`}>
      <div className={styles.game}>
        <h2 className={styles.gameTitle}>{game.name}</h2>
        <div className={styles.statusContainer}>
          <p className={styles.isOnline}>{statusLabel}</p>
          <div
            className={`${styles.statusIndicator} ${styles[game.state]}`}
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
          <div
            ref={badgeRef}
            className={`${styles.playerBadge} ${hasOnlinePlayers ? styles.clickable : ""}`}
            onClick={() => hasOnlinePlayers && setIsTooltipOpen((v) => !v)}
          >
            <span>
              {game.playerOnLine} / {game.totalPlayer} joueurs
            </span>
            {hasOnlinePlayers && (
              <div
                className={`${styles.playerTooltip} ${isTooltipOpen ? styles.playerTooltipOpen : ""}`}
              >
                <p className={styles.playerTooltipTitle}>En ligne</p>
                <ul className={styles.playerList}>
                  {game.players.map((player) => (
                    <li key={player}>{player}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <p className={styles.serverDescription}>{game.description}</p>
      </div>
    </div>
  );
}
