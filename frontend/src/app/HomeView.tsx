"use client";
import { useAuth } from "@/context/AuthContext";
import { useAppUI } from "@/context/AppUIContext";
import LandingPage from "@/components/LandingPage/LandingPage";
import ServerStatus from "@/components/ServerStatus/ServerStatus";
import AccountSettings from "@/components/AccountSettings/AccountSettings";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { type IGamesList } from "./page";

export default function HomeView({ gamesList }: { gamesList: IGamesList[] }) {
  const { user, isLoading } = useAuth();
  const { activeView } = useAppUI();

  return (
    <div>
      {isLoading && <LoadingScreen />}
      {!isLoading && !user && <LandingPage gamesList={gamesList} />}
      {!isLoading && user && activeView === "ServerStatus" && (
        <ServerStatus gamesList={gamesList} />
      )}
      {!isLoading && user && activeView === "AccountSettings" && (
        <AccountSettings />
      )}
    </div>
  );
}
