"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppUI } from "@/context/AppUIContext";
import styles from "./Header.module.css";
import AuthCard from "../AuthCard/AuthCard";
import Modal from "../ui/Modal";

export default function Header() {
  const { user, logout } = useAuth();
  const {
    isOpen,
    openAuth,
    closeAuth,
    openServerStatus,
    openAccountSettings,
  } = useAppUI();
  const [isLogin, setIsLogin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onSwitchClick = () => setIsLogin(!isLogin);

  const isUserLogin = () => {
    setIsLogin(true);
    openAuth();
  };

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.headerContainer}>
        <div className={styles.logo} onClick={openServerStatus}>
          <span className={styles.lin}>Lin</span>
          <span className={styles.choy}>Choy</span>
        </div>
        <div>
          {!user && (
            <button className={styles.btn} onClick={isUserLogin}>
              Connexion
            </button>
          )}

          {user && (
            <div className={styles.userMenuContainer} ref={dropdownRef}>
              <button
                type="button"
                className={styles.userAvatarBtn}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                aria-controls="user-dropdown-menu"
                aria-label="Ouvrir le menu utilisateur"
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </button>

              {isDropdownOpen && (
                <ul
                  id="user-dropdown-menu"
                  role="menu"
                  className={styles.dropdownMenu}
                >
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openServerStatus?.();
                      }}
                    >
                      Statut des serveurs
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openAccountSettings?.();
                      }}
                    >
                      Paramètres du compte
                    </button>
                  </li>
                  <li className={styles.dropdownDivider} role="none" />
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={`${styles.dropdownItem} ${styles.dangerItem}`}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                    >
                      Déconnexion
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}

          <Modal
            isOpen={isOpen}
            onClose={() => {
              setIsLogin(false);
              closeAuth();
            }}
          >
            <AuthCard
              onLoginSuccess={closeAuth}
              isLogin={isLogin}
              onSwitchClick={onSwitchClick}
            />
          </Modal>
        </div>
      </header>
    </div>
  );
}
