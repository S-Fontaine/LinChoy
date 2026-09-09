"use client";
import { useState } from "react";
import { copyIcon, checkIcon } from "../icons/Icons";

const buttonClass =
  "flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent p-0 text-inherit";

export default function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={buttonClass}
      aria-label={copied ? "Copié" : `Copier ${value}`}
    >
      <code className="text-[1rem] font-semibold text-text-high">{value}</code>
      {copied ? checkIcon : copyIcon}
    </button>
  );
}
