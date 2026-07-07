"use client";

export default function LandingPage() {
  const games = [
    { name: "Minecraft", icon: "⛏️", status: "Disponible" },
    { name: "Palworld", icon: "🦊", status: "Disponible" },
    { name: "Valheim", icon: "🛡️", status: "Disponible" },
    { name: "V Rising", icon: "🧛", status: "Disponible" },
    { name: "Et bien d'autres...", icon: "+", status: "En approche" },
  ];

  const platforms = ["Steam", "Xbox Live", "Epic Games", "PlayStation Network"];

  return (
    <div style={styles.container}>
      {/* --- GLOWS DE FOND (Effet Portfolio Tech) --- */}
      <div style={styles.glowOrange}></div>
      <div style={styles.glowGreen}></div>

      {/* --- HEADER / NAV --- */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={{ color: "var(--lin-orange)" }}>Lin</span>
          <span style={{ color: "var(--choy-green)" }}>Choy</span>
          <span style={styles.logoDot}>.</span>
        </div>
        <button style={styles.btnSecondary}>Connexion</button>
      </header>

      {/* --- BLOC CENTRAL ÉLARGI --- */}
      <main style={styles.mainContent}>
        {/* --- HERO SECTION --- */}
        <section style={styles.hero}>
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span> Serveurs propulsés maison •
            Accès libre
          </div>
          <h1 style={styles.mainTitle}>
            Rejoins notre communauté de <br />
            <span style={styles.gradientText}>Joueurs & Serveurs privés</span>
          </h1>
          <p style={styles.subtitle}>
            J&apos;héberge et j&apos;administre des infrastructures dédiées pour
            nos jeux préférés. Connecte tes plateformes, bascule sur le chat en
            temps réel, note tes sessions et viens build ou survivre avec nous !
          </p>
          <div style={styles.heroActions}>
            <button style={styles.btnPrimary}>
              Demander un accès (Discord/Inscription)
            </button>
            <button style={styles.btnSecondary}>
              Voir l&apos;état des serveurs
            </button>
          </div>
        </section>

        {/* --- GRID DE CONTENU (BENTO BOX STYLE) --- */}
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
              Connecte tes comptes pour synchroniser ta progression et retrouver
              tes amis en un clic.
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
                Quelqu&apos;un est chaud pour un boss sur Valheim ? 🔥
              </div>
              <div style={styles.chatMessage}>
                <strong style={{ color: "var(--choy-green-light)" }}>
                  Choy:
                </strong>{" "}
                J&apos;arrive, je répare ma pioche ! ⛏️
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// --- STYLES INLINE (Utilisent tes variables CSS existantes) ---
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    paddingBottom: "80px",
  },
  glowOrange: {
    position: "absolute",
    top: "-10%",
    left: "15%",
    width: "40vw",
    height: "40vw",
    background: "var(--lin-orange-glow)",
    filter: "blur(150px)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowGreen: {
    position: "absolute",
    top: "40%",
    right: "-5%",
    width: "35vw",
    height: "35vw",
    background: "var(--choy-green-glow)",
    filter: "blur(130px)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    maxWidth: "1200px", // Bloc central élargi
    margin: "0 auto",
    padding: "30px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 10,
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    color: "var(--text-high)",
  },
  logoDot: {
    color: "var(--lin-orange)",
  },
  mainContent: {
    maxWidth: "1250px", // Plus large que ton portfolio actuel pour aérer le contenu
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
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "0.85rem",
    color: "var(--text-high)",
    marginBottom: "24px",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    background: "var(--choy-green)",
    borderRadius: "50%",
    boxShadow: "0 0 8px var(--choy-green)",
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
  btnSecondary: {
    background: "var(--bg-surface)",
    color: "var(--text-high)",
    border: "1px solid var(--border)",
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
    gridColumn: "1 / -1", // Prend toute la largeur pour imiter le look Bento Pro
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
