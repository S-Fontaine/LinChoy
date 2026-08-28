"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPage";
import Header from "@/components/Header/Header";
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
    online: boolean;
    playerCount: number;
    lastChecked: Date;
  };
}

export default function Home() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [page, setPage] = useState<"ServerStatus" | "AccountSettings">(
    "ServerStatus",
  );
  const [gamesList, setGamesList] = useState<IGamesList[]>([]);
  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);

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
      <Header
        isAuthOpen={isAuthOpen}
        onOpenAuth={openAuth}
        onCloseAuth={closeAuth}
        onLoginSuccess={closeAuth}
        openServerStatus={() => setPage("ServerStatus")}
        openAccountSettings={() => setPage("AccountSettings")}
      />
      {!user && <LandingPage openAuth={openAuth} gamesList={gamesList} />}
      {user && page === "ServerStatus" && (
        <ServerStatus gamesList={gamesList} />
      )}
      {user && page === "AccountSettings" && <AccountSettings />}
    </div>
  );
}
