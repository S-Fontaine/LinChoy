"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAppUI } from "@/context/AppUIContext";
import LandingPage from "@/components/LandingPage/LandingPage";
import ServerStatus from "@/components/ServerStatus/ServerStatus";
import AccountSettings from "@/components/AccountSettings/AccountSettings";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export interface IGamesList {
  name: string;
  comingSoon: boolean;
  image: string;
  type: string;
  slug: string;
  status: {
    state: "offline" | "starting" | "online";
    online: boolean;
    playerCount: number;
    lastChecked: Date;
  };
}

export default function Home() {
  const { user } = useAuth();
  const { activeView } = useAppUI();
  const [gamesList, setGamesList] = useState<IGamesList[]>([]);

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch(`${BACKEND_URL}/games`, {
          method: "GET",
        });
        const data = await response.json();
        if (data) {
          setGamesList(data.servers);
        }
      } catch (err) {
        console.error("Erreur de récupération :", err);
      }
    }
    getData();
  }, [user]);

  return (
    <div>
      {!user && <LandingPage gamesList={gamesList} />}
      {user && activeView === "ServerStatus" && (
        <ServerStatus gamesList={gamesList} />
      )}
      {user && activeView === "AccountSettings" && <AccountSettings />}
    </div>
  );
}
