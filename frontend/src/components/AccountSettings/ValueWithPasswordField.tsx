"use client";
import { rowInputClass } from "./AccountSettings.styles";
import { PasswordInput } from "./PasswordEditField";

export interface ValueWithPassword {
  value: string;
  currentPassword: string;
}

export const emptyValueWithPassword: ValueWithPassword = {
  value: "",
  currentPassword: "",
};

export default function ValueWithPasswordField({
  value,
  setValue,
  email,
  inputType = "text",
  placeholder,
}: {
  value: ValueWithPassword;
  setValue: (v: ValueWithPassword) => void;
  email: string;
  inputType?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type={inputType}
        className={rowInputClass}
        value={value.value}
        onChange={(e) => setValue({ ...value, value: e.target.value })}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus
      />

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
      />
    </div>
  );
}
