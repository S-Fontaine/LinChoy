"use client";
import styles from "../styles/page.module.css";
import { useEffect, useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
//Typescript
interface ServerData {
  status: string;
  statusRAM: string;
  statusCharge1: string;
  statusCharge5: string;
  statusCharge15: string;
}

export default function Home() {
  const [serverState, setServerState] = useState<ServerData | null>(null);
  const [isOn, setIsOn] = useState<string>(styles.isOff);
  function togglePower() {
    setIsOn(isOn === styles.isOff ? styles.isOn : styles.isOff);
  }
  useEffect(() => {
    fetch(`${BACKEND_URL}/server/server-status`)
      .then((reponse) => reponse.json())
      .then((data: ServerData) => {
        setServerState(data);
        console.log(data);
      });
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.badge}>Performance</div>
          <h2>Etat Global du Serveur</h2>

          {serverState !== null && (
            <div>
              <p>{serverState.status}</p>
              <p>{serverState.statusRAM}</p>
              <p>{serverState.statusCharge1}</p>
              <p>{serverState.statusCharge5}</p>
              <p>{serverState.statusCharge15}</p>
            </div>
          )}
        </div>
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
    </div>
  );
}
