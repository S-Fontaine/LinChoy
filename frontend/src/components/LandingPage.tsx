"use client";
import styles from "@/styles/LandingPage.module.css";

interface ILandingPage {
  openAuth: () => void;
}
export default function LandingPage({ openAuth }: ILandingPage) {
  const games = [
    { name: "Minecraft", icon: "⛏️", status: "Disponible" },
    { name: "Palworld", icon: "🦊", status: "Disponible" },
    { name: "Valheim", icon: "🛡️", status: "Disponible" },
    { name: "V Rising", icon: "🧛", status: "Disponible" },
    { name: "Et bien d'autres...", icon: "+", status: "En approche" },
  ];

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
            <button className={styles.btn}>
              Voir l&apos;état des serveurs
            </button>
          </div>
        </section>
        <section className={styles.grid}>
          {/* Box 1 : Les Serveurs (Large) */}
          <div className={`${styles.card} ${styles.cardLarge}`}>
            <h2>Nos Serveurs Actifs</h2>
            <div className={styles.gameList}>
              {games.map((game, idx) => (
                <div key={idx} className={styles.gameItem}>
                  <div className={styles.gameInfo}>
                    <span className={styles.gameIcon}>{game.icon}</span>
                    <span className={styles.gameName}>{game.name}</span>
                  </div>
                  <span
                    className={styles.statusTag}
                    style={{
                      color:
                        game.status === "Disponible"
                          ? "var(--choy-green-light)"
                          : "var(--text-low)",
                      borderColor:
                        game.status === "Disponible"
                          ? "rgba(50, 205, 50, 0.2)"
                          : "var(--border)",
                    }}
                  >
                    {game.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2 : Cross-Platform */}
          <div className={styles.card}>
            <h2>Liaison Multi-Plateforme</h2>
            <p
              style={{ color: "var(--text-medium)", marginBottom: "24px" }}
            >
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
            <p
              style={{ color: "var(--text-medium)", marginBottom: "20px" }}
            >
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
