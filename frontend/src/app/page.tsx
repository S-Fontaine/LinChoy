"use client";
import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import Header from "@/components/Header";
import ServerStatus from "@/components/ServerStatus";

export default function Home() {
  const [step, setStep] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  function onSuccess() {
    setStep(step + 1);
  }

  const openAuth = () => {
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  return (
    <div>
      <Header
        onSuccess={onSuccess}
        isAuthOpen={isAuthOpen}
        onOpenAuth={openAuth}
        onCloseAuth={closeAuth}
      />
      {step === 0 && <LandingPage openAuth={openAuth}  />}
      {step === 1 && <ServerStatus />}
    </div>
  );
}
