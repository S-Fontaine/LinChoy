import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} LinChoy. Tous droits réservés.
        </p>
        <nav className={styles.links}>
          <Link href="/mentions-legales" className={styles.link}>
            Mentions légales
          </Link>
          <Link href="/confidentialite" className={styles.link}>
            Politique de confidentialité
          </Link>
          <a href="mailto:contact@linchoy.com" className={styles.link}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
