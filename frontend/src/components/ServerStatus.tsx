"use client";
import styles from "../styles/ServerStatus.module.css";
import { useState } from "react";
//Typescript

export default function Home() {
  const [isOn, setIsOn] = useState<string>(styles.isOff);
  function togglePower() {
    setIsOn(isOn === styles.isOff ? styles.isOn : styles.isOff);
  }
  return (
    <div className={styles.container}>
        <div className={`${styles.controlBox} ${isOn}`}>
          <div className={styles.statusIndicator}></div>
          <h3>Etat du serveur</h3>
          <div
            className={
              isOn === styles.isOff ? styles.backgroundOff : styles.backgroundOn
            }
          ></div>
          <p>
            {`Le serveur est actuellement `}
            <span className={styles.statusLabel}>
              {isOn === styles.isOff ? `${" OFF"}` : `${" ON "}`}
            </span>
          </p>

          <button className={styles.toggleBtn} onClick={togglePower}>
            <div className={styles.switch}></div>
          </button>
        </div>
      </div>
  );
}
