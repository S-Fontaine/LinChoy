"use client";
import styles from "../styles/ServerStatus.module.css";
import Image from "next/image";
import { useState } from "react";
import palworldImg from "../../public/assets/palworld.png";

const game = {
  name: "Palworld",
  image: "../../public/assets/palworld.png",
  totalPlayer: 10,
  playerOnLine: 2,
  serverType: "PVE Survie",
};

export default function Home() {
  const [isServerOn, setIsServerOn] = useState<boolean>(true);
  const togglePower = () => setIsServerOn((prev) => !prev);
  return (
    <main className={styles.mainContent}>
      <section className={styles.server}>
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
              src={palworldImg}
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
        <div className={`${styles.card} ${isServerOn && styles.isOn}`}>
          <div className={styles.game}>
            <h2>{game.name}</h2>
            <div
              className={`${styles.statusIndicator} ${isServerOn && styles.isOn}`}
              onClick={togglePower}
            ></div>
          </div>
          <div className={styles.serverInfo}>
            <ul>
              <li>Nombre de Joueur : {game.totalPlayer}</li>
              <li>Joueur en Ligne : {game.playerOnLine}</li>
              <li>Serveur : {game.serverType}</li>
            </ul>
          </div>
        </div>
        <div className={`${styles.card} ${isServerOn && styles.isOn}`}>
          <div className={styles.game}>
            <h2>{game.name}</h2>
            <div
              className={`${styles.statusIndicator} ${isServerOn && styles.isOn}`}
              onClick={togglePower}
            ></div>
          </div>
          <div className={styles.serverInfo}>
            <ul>
              <li>Nombre de Joueur : {game.totalPlayer}</li>
              <li>Joueur en Ligne : {game.playerOnLine}</li>
              <li>Serveur : {game.serverType}</li>
            </ul>
          </div>
        </div>
        <div className={`${styles.card} ${isServerOn && styles.isOn}`}>
          <div className={styles.game}>
            <h2>{game.name}</h2>
            <div
              className={`${styles.statusIndicator} ${isServerOn && styles.isOn}`}
              onClick={togglePower}
            ></div>
          </div>
          <div className={styles.serverInfo}>
            <ul>
              <li>Nombre de Joueur : {game.totalPlayer}</li>
              <li>Joueur en Ligne : {game.playerOnLine}</li>
              <li>Serveur : {game.serverType}</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
