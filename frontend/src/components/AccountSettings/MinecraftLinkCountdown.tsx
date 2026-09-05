"use client";
import { useEffect, useState } from "react";
import styles from "./MinecraftLinkCountdown.module.css";

export default function MinecraftLinkCountdown({
  expiresAt,
}: {
  expiresAt: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = new Date(expiresAt).getTime() - now;

  if (remainingMs <= 0) {
    return (
      <p className={styles.hintText}>
        Le délai est écoulé, la liaison va être libérée d&apos;un instant à
        l&apos;autre.
      </p>
    );
  }

  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label =
    hours > 0
      ? `${hours}h${String(minutes).padStart(2, "0")}`
      : `${minutes} min`;

  return (
    <p className={styles.hintText}>
      Connecte-toi sur le serveur pour confirmer la liaison — expire dans{" "}
      {label}.
    </p>
  );
}
