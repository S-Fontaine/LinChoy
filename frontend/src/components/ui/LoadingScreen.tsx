import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <span className={styles.lin}>Lin</span>
        <span className={styles.choy}>Choy</span>
      </div>
      <div className={styles.spinner} />
    </div>
  );
}
