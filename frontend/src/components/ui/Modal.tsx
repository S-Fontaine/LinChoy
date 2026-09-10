"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { cross } from "../icons/Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-1000 flex items-start justify-center overflow-y-auto bg-[rgba(0,0,0,0.9)] animate-[fadeIn_0.2s_ease-out]">
      <div className="relative mt-16 w-93.75 max-h-[calc(100vh-64px-32px)] overflow-y-auto rounded-2xl border border-border bg-bg-surface p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[scaleIn_0.25s_cubic-bezier(0.4,0,0.2,1)] scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [@media(max-height:700px)]:mt-6 [@media(max-height:700px)]:max-h-[calc(100vh-48px)]">
        <button
          className="absolute top-3 right-3 z-1001 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-bg-input text-text-medium transition-all duration-300 ease-smooth"
          onClick={onClose}
          aria-label="Fermer"
        >
          {cross}
        </button>
        {children}
      </div>
    </div>
  );
}
