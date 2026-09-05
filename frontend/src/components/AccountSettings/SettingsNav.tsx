"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./SettingsNav.module.css";

const NAV_ITEMS = [
  { key: "compte", label: "Compte et sécurité", comingSoon: false },
  { key: "notifications", label: "Notifications", comingSoon: true },
  { key: "confidentialite", label: "Confidentialité", comingSoon: true },
];

export default function SettingsNav({
  activeSection,
  onSectionChange,
  onDeleteClick,
}: {
  activeSection: string;
  onSectionChange: (key: string) => void;
  onDeleteClick: () => void;
}) {
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const activeItem = NAV_ITEMS.find((item) => item.key === activeSection);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node)
      ) {
        setIsMobileNavOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMobileNavOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className={styles.mobileNav} ref={mobileNavRef}>
        <button
          type="button"
          className={styles.mobileNavTrigger}
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-haspopup="menu"
          aria-expanded={isMobileNavOpen}
        >
          {activeItem?.label}
          <span
            className={`${styles.chevron} ${isMobileNavOpen ? styles.chevronOpen : ""}`}
          >
            ▾
          </span>
        </button>

        {isMobileNavOpen && (
          <ul role="menu" className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.key} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={styles.mobileNavItem}
                  disabled={item.comingSoon}
                  onClick={() => {
                    onSectionChange(item.key);
                    setIsMobileNavOpen(false);
                  }}
                >
                  {item.label}
                  {item.comingSoon && (
                    <span className={styles.soonTag}>Bientôt</span>
                  )}
                </button>
              </li>
            ))}
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.mobileNavItemDanger}
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onDeleteClick();
                }}
              >
                Supprimer le compte
              </button>
            </li>
          </ul>
        )}
      </div>
      <nav className={styles.sidebar}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`${styles.navItem} ${
              activeSection === item.key ? styles.navItemActive : ""
            } ${item.comingSoon ? styles.navItemDisabled : ""}`}
            onClick={() => !item.comingSoon && onSectionChange(item.key)}
            disabled={item.comingSoon}
          >
            {item.label}
            {item.comingSoon && <span className={styles.soonTag}>Bientôt</span>}
          </button>
        ))}
        <button
          className={`${styles.navItem} ${styles.navItemDanger}`}
          onClick={onDeleteClick}
        >
          Supprimer le compte
        </button>
      </nav>
    </>
  );
}
