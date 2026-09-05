"use client";
import styles from "./InlineMessage.module.css";

export type InlineMessageState = {
  type: "success" | "error";
  text: string;
};

export default function InlineMessage({
  message,
  onClose,
}: {
  message: InlineMessageState;
  onClose: () => void;
}) {
  return (
    <div
      className={
        message.type === "success" ? styles.successBox : styles.errorBox
      }
    >
      <span>{message.text}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer le message"
        className={styles.closeMessageBtn}
      >
        ×
      </button>
    </div>
  );
}
