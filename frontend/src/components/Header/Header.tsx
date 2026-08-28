"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./Header.module.css";
import AuthCard from "../AuthCard/AuthCard";
import Modal from "../ui/Modal";

interface IHeader {
  onLoginSuccess?: () => void;
  isAuthOpen?: boolean;
  onOpenAuth?: () => void;
  onCloseAuth?: () => void;
  isEmailButtonVisible?: boolean;
  openAccountSettings?: () => void;
  openServerStatus?: () => void;
}

export default function Header({
  onLoginSuccess,
  isAuthOpen = false,
  onOpenAuth,
  onCloseAuth,
  isEmailButtonVisible = false,
  openAccountSettings,
  openServerStatus,
}: IHeader) {
  const { user, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log(user);
  const onSwitchClick = () => {
    setIsLogin(!isLogin);
  };

  const isUserLogin = () => {
    setIsLogin(true);
    onOpenAuth?.();
  };

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
          {!user && !isEmailButtonVisible && (
            <button className={styles.btn} onClick={isUserLogin}>
              Connexion
            </button>
          )}

          {user && (
            <div className={styles.userMenuContainer} ref={dropdownRef}>
              <button
                className={styles.userAvatarBtn}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      openServerStatus?.();
                    }}
                  >
                    Statut des serveurs
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      openAccountSettings?.();
                    }}
                  >
                    Paramètres du compte
                  </button>
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.dangerItem}`}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}

          <Modal
            isAuthOpen={isAuthOpen}
            onCloseAuth={() => {
              setIsLogin(false);
              onCloseAuth?.();
            }}
          >
            <AuthCard
              onLoginSuccess={onLoginSuccess}
              isLogin={isLogin}
              onSwitchClick={onSwitchClick}
            />
          </Modal>
        </div>
      </header>
    </div>
  );
}
