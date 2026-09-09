"use client";
import { useEffect, useRef } from "react";

export type InlineMessageState = {
  type: "success" | "error";
  text: string;
};

const AUTO_DISMISS_MS = 5000;

const boxClass =
  "flex items-center justify-between gap-3 rounded-lg border p-3 mb-6 text-center text-[0.9rem]";
const successBoxClass = `${boxClass} border-choy-green bg-[rgba(50,205,50,0.1)] text-choy-green-light`;
const errorBoxClass = `${boxClass} border-lin-orange bg-[rgba(255,140,0,0.1)] text-lin-orange-light`;

export default function InlineMessage({
  message,
  onClose,
}: {
  message: InlineMessageState;
  onClose: () => void;
}) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const timeout = setTimeout(() => onCloseRef.current(), AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div className={message.type === "success" ? successBoxClass : errorBoxClass}>
      <span>{message.text}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer le message"
        className="cursor-pointer border-0 bg-transparent px-1 text-[1.2rem] leading-none text-inherit"
      >
        ×
      </button>
    </div>
  );
}
