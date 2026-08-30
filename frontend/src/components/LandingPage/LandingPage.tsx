"use client";
import styles from "./LandingPage.module.css";
import { type IGamesList } from "@/app/page";
import { useAppUI } from "@/context/AppUIContext";

interface ILandingPage {
  gamesList: IGamesList[];
}

export default function LandingPage({ gamesList }: ILandingPage) {
  const { openAuth } = useAppUI();
  const scrollToSection = () => {
    const section = document.getElementById("server-status");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

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
            Suis en direct l&apos;état de nos serveurs de jeux et rejoins la
            communauté pour build ou survivre avec nous !
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
            <h2>Nos Serveurs</h2>
            <div className={styles.gameList}>
              {gamesList.map((game) => (
                <div key={game.slug} className={styles.gameItem}>
                  <div className={styles.gameInfo}>
                    <span className={styles.gameName}>{game.name}</span>
                  </div>
                  <span
                    className={styles.statusTag}
                    style={
                      game.comingSoon
                        ? {
                            color: "var(--text-low)",
                            borderColor: "var(--border)",
                          }
                        : {
                            color: "var(--choy-green)",
                            borderColor: "var(--choy-green-glow)",
                          }
                    }
                  >
                    {game.comingSoon ? "Bientôt disponible" : "Disponible"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2 : Cross-Platform */}
          <div className={`${styles.card} ${styles.cardSoon}`}>
            <span className={styles.soonBadge}>Bientôt disponible</span>
            <h2>Liaison Multi-Plateforme</h2>
            <p style={{ color: "var(--text-medium)", marginBottom: "24px" }}>
              Connecte tes comptes pour synchroniser ta progression et retrouver
              tes amis en un clic. Une fonctionnalité en cours de développement.
            </p>
          </div>

          {/* Box 3 : Communauté / Chat */}
          <div className={`${styles.card} ${styles.cardSoon}`}>
            <span className={styles.soonBadge}>Bientôt disponible</span>
            <h2>Chat & Notes</h2>
            <p style={{ color: "var(--text-medium)" }}>
              Un espace de discussion intégré directement lié à tes serveurs,
              pour partager tes retours sur tes parties. Arrive prochainement.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
