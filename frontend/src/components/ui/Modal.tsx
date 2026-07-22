"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import styles from "./Modal.module.css";
import { cross } from "../icons/Icons";

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
          {cross}
        </button>
        {children}
      </div>
    </div>
  );
}
