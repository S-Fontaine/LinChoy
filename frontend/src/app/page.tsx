"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LandingPage from "@/components/LandingPage/LandingPage";
import Header from "@/components/Header/Header";
import ServerStatus from "@/components/ServerStatus/ServerStatus";

export default function Home() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const openAuth = () => setIsAuthOpen(true);
  const closeAuth = () => setIsAuthOpen(false);

  return (
    <div>
      <Header
        isAuthOpen={isAuthOpen}
        onOpenAuth={openAuth}
        onCloseAuth={closeAuth}
        onLoginSuccess={closeAuth}
      />
      {!user && <LandingPage openAuth={openAuth} />}
      {user && <ServerStatus />}
    </div>
  );
}
