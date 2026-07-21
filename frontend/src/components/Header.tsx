"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "../styles/Header.module.css";
import AuthCard from "./AuthCard";
import Modal from "./Modal";

interface IHeader {
  onLoginSuccess?: () => void;
  isAuthOpen?: boolean;
  onOpenAuth?: () => void;
  onCloseAuth?: () => void;
  isEmailButtonVisible?: boolean;
}

export default function Header({
  onLoginSuccess,
  isAuthOpen = false,
  onOpenAuth,
  onCloseAuth,
  isEmailButtonVisible = false,
}: IHeader) {
  const { user, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  //const [isEmailButtonVisible, setIsEmailButtonVisible] = useState(false);
  const onSwitchClick = () => {
    setIsLogin(!isLogin);
  };
  const isUserLogin = () => {
    setIsLogin(true);
    onOpenAuth?.();
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerContainer}>
        <div className={styles.logo}>
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
            <button className={styles.btn} onClick={logout}>
              Déconnexion
            </button>
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
