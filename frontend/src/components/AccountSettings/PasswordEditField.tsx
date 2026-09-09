"use client";
import { useState } from "react";
import { rowInputClass } from "./AccountSettings.styles";
import PasswordRulesList from "../ui/PasswordRulesList";
import { checkPasswordStrength } from "@/lib/passwordRules";
import { eyeOff, eyeOn } from "../icons/Icons";

export interface PasswordFormValue {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const emptyPasswordFormValue: PasswordFormValue = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const eyeButtonClass =
  "absolute top-1/2 right-5 z-[2] flex -translate-y-1/2 items-center rounded-full border-0 bg-transparent p-0 text-text-medium cursor-pointer";

export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  autoFocus?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        className={`${rowInputClass} w-full pr-11.25`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
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
  );
}

export default function PasswordEditField({
  value,
  setValue,
  email,
}: {
  value: PasswordFormValue;
  setValue: (v: PasswordFormValue) => void;
  email: string;
}) {
  const { isComplete } = checkPasswordStrength(value.newPassword);
  const confirmMismatch =
    value.confirmPassword.length > 0 &&
    value.newPassword !== value.confirmPassword;

  return (
    <div className="flex flex-col gap-2">
      <input
        type="email"
        autoComplete="username"
        value={email}
        readOnly
        tabIndex={-1}
        className="sr-only"
      />

      <PasswordInput
        value={value.currentPassword}
        onChange={(v) => setValue({ ...value, currentPassword: v })}
        placeholder="Mot de passe actuel"
        autoComplete="current-password"
        autoFocus
      />

      <PasswordInput
        value={value.newPassword}
        onChange={(v) => setValue({ ...value, newPassword: v })}
        placeholder="Nouveau mot de passe"
        autoComplete="new-password"
      />

      <PasswordRulesList password={value.newPassword} />

      {value.newPassword.length > 0 && !isComplete && (
        <p className="text-[0.8rem] text-lin-orange">
          Le mot de passe doit respecter toutes les règles ci-dessus.
        </p>
      )}

      <PasswordInput
        value={value.confirmPassword}
        onChange={(v) => setValue({ ...value, confirmPassword: v })}
        placeholder="Confirmer le nouveau mot de passe"
        autoComplete="new-password"
      />

      {confirmMismatch && (
        <p className="text-[0.8rem] text-lin-orange">
          Les mots de passe ne correspondent pas.
        </p>
      )}
    </div>
  );
}
