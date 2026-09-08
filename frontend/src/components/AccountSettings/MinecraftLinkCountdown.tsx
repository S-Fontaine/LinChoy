"use client";
import { useEffect, useState } from "react";

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
      <p className={"text-[0.8rem] text-lin-orange"}>
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
    <p className={"text-[0.8rem] text-lin-orange"}>
      Connecte-toi sur le serveur pour confirmer la liaison — expire dans{" "}
      {label}.
    </p>
  );
}
