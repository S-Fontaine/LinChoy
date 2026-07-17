"use client";
import { useState } from "react";

import styles from "../styles/Header.module.css";
import AuthCard from "./AuthCard";
import Modal from "./Modal";

interface IHeader {
  onLoginSuccess?: () => void;
  isAuthOpen?: boolean;
  onOpenAuth?: () => void;
  onCloseAuth?: () => void;
}

export default function Header({
  onLoginSuccess,
  isAuthOpen = false,
  onOpenAuth,
  onCloseAuth,
}: IHeader) {
  const [isLogin, setIsLogin] = useState(false);

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
          <button className={styles.btn} onClick={isUserLogin}>
            Connexion
          </button>
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
