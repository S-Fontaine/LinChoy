"use client";
import Header from "@/components/Header";
import styles from "../../styles/AuthCard.module.css";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    async function verifyEmail() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/auth/email/verify?token=${token}`,
          { method: "GET", credentials: "include" },
        );
        const data = await response.json();
        setMessage(data.message);
      } catch {
        setMessage("Impossible de joindre le serveur. Réessayez plus tard.");
      }
    }

    verifyEmail();
  }, [searchParams]);

  return (
    <div>
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>{message}</h2>
          </div>
          <div className={styles.form}>
            {" "}
            <button
              className={styles.btnPrimary}
              onClick={() => router.push("/")}
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
