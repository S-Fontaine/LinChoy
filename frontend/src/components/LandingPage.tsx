"use client";

import AuthCard from "./AuthCard";
import { useState, useEffect } from "react";

interface ILandingPage {
  propsIsLogin: boolean;
  propsIsOpen: boolean;
  onSuccess: () => void;
}

export default function LandingPage({
  propsIsLogin,
  propsIsOpen,
  onSuccess,
}: ILandingPage) {
  const games = [
    { name: "Minecraft", icon: "⛏️", status: "Disponible" },
    { name: "Palworld", icon: "🦊", status: "Disponible" },
    { name: "Valheim", icon: "🛡️", status: "Disponible" },
    { name: "V Rising", icon: "🧛", status: "Disponible" },
    { name: "Et bien d'autres...", icon: "+", status: "En approche" },
  ];

  const platforms = ["Steam", "Xbox Live", "Epic Games", "PlayStation Network"];
  const [isOpen, setIsOpen] = useState<boolean>(propsIsOpen);
  const [isLogin, setIsLogin] = useState<boolean>(propsIsLogin);

  useEffect(() => {
    setIsOpen(propsIsOpen);
  }, [propsIsOpen]);

  useEffect(() => {
    setIsLogin(propsIsLogin);
  }, [propsIsLogin]);

  console.log(isLogin, "et", isOpen);
  function onSwitchClick() {
    setIsLogin(!isLogin);
  }
  function onRegisterClick() {
    setIsLogin(propsIsLogin);
    setIsOpen(!isOpen);
  }

  function onResult() {
    onSuccess();
  }

  return (
    <div style={styles.container}>
      {/* --- GLOWS DE FOND --- */}

      {isOpen ? (
        <AuthCard
          isLogin={isLogin}
          onSwitchClick={onSwitchClick}
          onResult={onResult}
        />
      ) : (
        <main style={styles.mainContent}>
          <section style={styles.hero}>
            <h1 style={styles.mainTitle}>
              Rejoins notre communauté de <br />
              <span style={styles.gradientText}>Joueurs & Serveurs privés</span>
            </h1>
            <p style={styles.subtitle}>
              Connecte tes plateformes, bascule sur le chat en temps réel, note
              tes jeux et viens build ou survivre avec nous !
            </p>
            <div style={styles.heroActions}>
              <button style={styles.btnPrimary} onClick={onRegisterClick}>
                Inscription
              </button>
              <button style={styles.btnPrimary}>
                Voir l&apos;état des serveurs
              </button>
            </div>
          </section>
          <section style={styles.grid}>
            {/* Box 1 : Les Serveurs (Large) */}
            <div style={{ ...styles.card, ...styles.cardLarge }}>
              <h2>Nos Serveurs Actifs</h2>
              <div style={styles.gameList}>
                {games.map((game, idx) => (
                  <div key={idx} style={styles.gameItem}>
                    <div style={styles.gameInfo}>
                      <span style={styles.gameIcon}>{game.icon}</span>
                      <span style={styles.gameName}>{game.name}</span>
                    </div>
                    <span
                      style={{
                        ...styles.statusTag,
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
            <div style={styles.card}>
              <h2>Liaison Multi-Plateforme</h2>
              <p style={{ color: "var(--text-medium)", marginBottom: "24px" }}>
                Connecte tes comptes pour synchroniser ta progression et
                retrouver tes amis en un clic.
              </p>
              <div style={styles.platformGrid}>
                {platforms.map((platform, idx) => (
                  <div key={idx} style={styles.platformBadge}>
                    {platform}
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3 : Communauté / Chat */}
            <div style={styles.card}>
              <h2>Chat & Notes</h2>
              <p style={{ color: "var(--text-medium)", marginBottom: "20px" }}>
                Un espace de discussion intégré directement lié à tes serveurs.
                Note et partage tes retours sur vos parties endiablées.
              </p>
              <div style={styles.fakeChat}>
                <div style={styles.chatMessage}>
                  <strong style={{ color: "var(--lin-orange-light)" }}>
                    Linfu:
                  </strong>{" "}
                  Chaud pour Palworld ?
                </div>
                <div style={styles.chatMessage}>
                  <strong style={{ color: "var(--choy-green-light)" }}>
                    Drahoy:
                  </strong>{" "}
                  Je finis ma game, et je suis là !
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

// --- STYLES INLINE ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    paddingBottom: "80px",
  },

  mainContent: {
    maxWidth: "1250px",
    margin: "0 auto",
    padding: "0 24px",
    position: "relative",
    zIndex: 10,
  },
  hero: {
    textAlign: "center",
    padding: "80px 0 60px 0",
    maxWidth: "800px",
    margin: "0 auto",
  },

  mainTitle: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: "800",
    lineHeight: 1.15,
    letterSpacing: "-1.5px",
    color: "var(--text-high)",
    marginBottom: "24px",
  },
  gradientText: {
    background:
      "linear-gradient(to right, var(--lin-orange), var(--choy-green-light))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.15rem",
    color: "var(--text-medium)",
    maxWidth: "600px",
    margin: "0 auto 40px auto",
    lineHeight: "1.7",
  },
  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },
  btnPrimary: {
    background: "var(--text-high)",
    color: "var(--bg-main)",
    border: "none",
    padding: "14px 28px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "var(--transition-smooth)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
    marginTop: "40px",
  },
  card: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  cardLarge: {
    gridColumn: "1 / -1",
  },
  gameList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "10px",
  },
  gameItem: {
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gameInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  gameIcon: {
    fontSize: "1.3rem",
  },
  gameName: {
    color: "var(--text-high)",
    fontWeight: "500",
  },
  statusTag: {
    fontSize: "0.75rem",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid",
    fontWeight: "600",
  },
  platformGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  platformBadge: {
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    padding: "12px",
    borderRadius: "100px",
    textAlign: "center",
    fontSize: "0.85rem",
    color: "var(--text-high)",
    fontWeight: "500",
  },
  fakeChat: {
    background: "var(--bg-input)",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontFamily: "monospace",
    fontSize: "0.85rem",
  },
  chatMessage: {
    lineHeight: "1.4",
    color: "var(--text-high)",
  },
};
