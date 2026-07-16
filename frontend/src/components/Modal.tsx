"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import styles from "../styles/Modal.module.css";

interface ModalProps {
  isAuthOpen: boolean;
  onCloseAuth: () => void;
  children: ReactNode;
}

export default function Modal({
  isAuthOpen,
  onCloseAuth,
  children,
}: ModalProps) {
  const crossSvg = (
    <svg viewBox="0 0 24 24" fill="#757575">
      <path d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"></path>
    </svg>
  );
  useEffect(() => {
    if (!isAuthOpen) return;
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseAuth();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isAuthOpen, onCloseAuth]);

  if (!isAuthOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button
          className={styles.closeBtn}
          onClick={onCloseAuth}
          aria-label="Fermer"
        >
          {crossSvg}
        </button>
        {children}
      </div>
    </div>
  );
}
