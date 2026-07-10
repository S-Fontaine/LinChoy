"use client";
import styles from "../styles/Header.module.css";

export default function Header({
  onLoginClick,
}: {
  onLoginClick?: () => void;
}) {
  return (
    <div className={styles.container}>
      <header className={styles.headerContainer}>
        <div className={styles.logo}>
          <span className={styles.lin}>Lin</span>
          <span className={styles.choy}>Choy</span>
        </div>
        <button className={styles.btn} onClick={onLoginClick}>
          Connexion
        </button>
      </header>
    </div>
  );
}
