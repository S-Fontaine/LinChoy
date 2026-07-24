"use client";
import styles from "./LandingPage.module.css";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
interface ILandingPage {
  openAuth: () => void;
}
export default function LandingPage({ openAuth }: ILandingPage) {
  const { user } = useAuth();
  const [gamesList, setGamesList] = useState([]);
  useEffect(() => {
    if (user) return;
    async function getData() {
      try {
        const response = await fetch(`${BACKEND_URL}/games`, {
          method: "GET",
        });
        const data = await response.json();
        if (data) {
          setGamesList(data.gamesList);
        }
      } catch (err) {
        console.error("Erreur de récupération :", err);
      }
    }
    getData();
  }, [user]);

  const scrollToSection = () => {
    const section = document.getElementById("server-status");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  const platforms = ["Steam", "Xbox Live", "Epic Games", "PlayStation Network"];
  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <h1 className={styles.mainTitle}>
            Rejoins notre communauté de <br />
            <span className={styles.gradientText}>
              Joueurs & Serveurs privés
            </span>
          </h1>
          <p className={styles.subtitle}>
            Connecte tes plateformes, bascule sur le chat en temps réel, note
            tes jeux et viens build ou survivre avec nous !
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btn} onClick={openAuth}>
              Inscription
            </button>
            <button className={styles.btn} onClick={scrollToSection}>
              Voir l&apos;état des serveurs
            </button>
          </div>
        </section>
        <section id="server-status" className={styles.grid}>
          {/* Box 1 : Les Serveurs (Large) */}
          <div className={`${styles.card} ${styles.cardLarge}`}>
            <h2>Nos Serveurs Actifs</h2>
            <div className={styles.gameList}>
              {gamesList.map((game, idx) => (
                <div key={idx} className={styles.gameItem}>
                  <div className={styles.gameInfo}>
                    <span className={styles.gameName}>{game}</span>
                  </div>
                  <span
                    className={styles.statusTag}
                    style={{
                      color: "var(--choy-green)",
                      borderColor: "var(--choy-green-glow)",
                    }}
                  >
                    Disponible
                  </span>
                </div>
              ))}
              <div className={styles.gameItem}>
                <div className={styles.gameInfo}>
                  <span className={styles.gameName}>
                    Et bien d&apos;autres...
                  </span>
                </div>
                <span
                  className={styles.statusTag}
                  style={{
                    color: "var(--text-low)",
                    borderColor: "var(--border)",
                  }}
                >
                  Disponible
                </span>
              </div>
            </div>
          </div>
          {/* Box 2 : Cross-Platform */}
          <div className={styles.card}>
            <h2>Liaison Multi-Plateforme</h2>
            <p style={{ color: "var(--text-medium)", marginBottom: "24px" }}>
              Connecte tes comptes pour synchroniser ta progression et retrouver
              tes amis en un clic.
            </p>
            <div className={styles.platformGrid}>
              {platforms.map((platform, idx) => (
                <div key={idx} className={styles.platformBadge}>
                  {platform}
                </div>
              ))}
            </div>
          </div>
          {/* Box 3 : Communauté / Chat */}
          <div className={styles.card}>
            <h2>Chat & Notes</h2>
            <p style={{ color: "var(--text-medium)", marginBottom: "20px" }}>
              Un espace de discussion intégré directement lié à tes serveurs.
              Note et partage tes retours sur vos parties endiablées.
            </p>
            <div className={styles.fakeChat}>
              <div className={styles.chatMessage}>
                <strong style={{ color: "var(--lin-orange-light)" }}>
                  Linfu:
                </strong>{" "}
                Chaud pour Palworld ?
              </div>
              <div className={styles.chatMessage}>
                <strong style={{ color: "var(--choy-green-light)" }}>
                  Drachoy:
                </strong>{" "}
                Je finis ma game, et je suis là !
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
