"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import styles from "./Modal.module.css";
import { cross } from "../icons/Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  children,
}: ModalProps) {
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
    <div className={styles.overlay}>
      <div className={styles.content}>
        <button
          className={styles.closeBtn}
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
