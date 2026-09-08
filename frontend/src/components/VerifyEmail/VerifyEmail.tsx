"use client";

import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";
import AuthCard from "@/components/AuthCard/AuthCard";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const btnClass =
  "cursor-pointer rounded-lg border border-border bg-bg-surface px-7 py-3.5 text-[0.95rem] font-semibold text-text-high transition-all duration-300 ease-smooth disabled:cursor-not-allowed disabled:opacity-50";

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
        <>
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-[1.75rem] font-bold tracking-[-0.5px] text-text-high">
              {response.result ? "Bienvenue !" : "Oups !"}
            </h2>
            <p className="text-[0.95rem] text-text-medium">
              {response.message}
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <button
              className={btnClass}
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
        </>
      )}
    </Modal>
  );
}
