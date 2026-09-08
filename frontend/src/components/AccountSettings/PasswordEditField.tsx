"use client";
import { useState } from "react";
import { rowInputClass } from "./AccountSettings.styles";
import PasswordRulesList from "../ui/PasswordRulesList";
import { checkPasswordStrength } from "@/lib/passwordRules";
import { eyeOff, eyeOn } from "../icons/Icons";

const eyeButtonClass =
  "absolute top-1/2 right-5 z-[2] flex -translate-y-1/2 items-center rounded-full border-0 bg-transparent p-0 text-text-medium cursor-pointer";

export default function PasswordEditField({
  value,
  setValue,
}: {
  value: string;
  setValue: (v: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { isComplete } = checkPasswordStrength(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          className={`${rowInputClass} w-full pr-11.25`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Nouveau mot de passe"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={eyeButtonClass}
          aria-label="Afficher ou masquer le mot de passe"
        >
          {showPassword ? eyeOff : eyeOn}
        </button>
      </div>

      <PasswordRulesList password={value} />

      {value.length > 0 && !isComplete && (
        <p className="text-[0.8rem] text-lin-orange">
          Le mot de passe doit respecter toutes les règles ci-dessus.
        </p>
      )}
    </div>
  );
}
