"use client";

import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";
import AuthCard from "@/components/AuthCard/AuthCard";
import styles from "./verify-email.module.css";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function VerifyEmail() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [response, setResponse] = useState({ result: false, message: "" });
  const [isOpen, setIsOpen] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (user) {
      router.push("/");
      return;
    }
    if (!token) return;

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/auth/email/verify?token=${token}`,
          { method: "GET", credentials: "include" },
        );
        const data = await response.json();
        setResponse(data);
      } catch {
        setResponse({
          result: false,
          message: "Impossible de joindre le serveur. Réessayez plus tard.",
        });
      }
    }
    verifyEmail();
  }, [token, user, router]);

  const closeAuth = () => {
    setIsOpen(false);
    router.push("/");
  };

  return (
    <Modal isOpen={isOpen} onClose={closeAuth}>
      {showAuth ? (
        <AuthCard isLogin={isLogin} onSwitchClick={() => setIsLogin(!isLogin)} />
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h2 className={styles.title}>
                {response.result ? "Bienvenue !" : "Oups !"}
              </h2>
              <p className={styles.subtitle}>{response.message}</p>
            </div>
            <div className={styles.form}>
              <button
                className={styles.btn}
                onClick={() => {
                  if (response.result) {
                    setShowAuth(true);
                  } else {
                    router.push("/");
                  }
                }}
              >
                {response.result ? "Se connecter" : "Retour à l'accueil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}