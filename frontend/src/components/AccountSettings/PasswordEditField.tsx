"use client";
import shared from "./AccountSettings.module.css";
import styles from "./PasswordEditField.module.css";
import PasswordRulesList from "../ui/PasswordRulesList";
import { checkPasswordStrength } from "@/lib/passwordRules";

export default function PasswordEditField({
  value,
  setValue,
}: {
  value: string;
  setValue: (v: string) => void;
}) {
  const { isComplete } = checkPasswordStrength(value);

  return (
    <div className={styles.passwordEditWrapper}>
      <input
        type="password"
        className={shared.rowInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nouveau mot de passe"
        autoFocus
      />

      <PasswordRulesList password={value} />

      {value.length > 0 && !isComplete && (
        <p className={styles.hintText}>
          Le mot de passe doit respecter toutes les règles ci-dessus.
        </p>
      )}
    </div>
  );
}
