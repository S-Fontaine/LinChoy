"use client";
import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import Header from "@/components/Header";
import ServerStatus from "@/components/ServerStatus";

export default function Home() {
  const [step, setStep] = useState(0);
  const [landingPageProps, setLandingPageProps] = useState({
    isLogin: false,
    isOpen: false,
  });

  function onLoginClick() {
    setLandingPageProps((prev) => ({
      ...prev,
      isLogin: true,
      isOpen: !landingPageProps.isOpen,
    }));
  }
  function onSuccess() {
    setStep(step + 1);
  }
  return (
    <div>
      <Header onLoginClick={onLoginClick} />
      {step === 0 && (
        <LandingPage
          onSuccess={onSuccess}
          propsIsLogin={landingPageProps.isLogin}
          propsIsOpen={landingPageProps.isOpen}
        />
      )}
      {step === 1 && <ServerStatus />}
    </div>
  );
}
