"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./Header.module.css";
import AuthCard from "../AuthCard/AuthCard";
import Modal from "../ui/Modal";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
        <div className={styles.logo} onClick={() => router.push("/")}>
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
