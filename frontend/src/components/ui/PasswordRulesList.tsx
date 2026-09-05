"use client";
import { PASSWORD_RULES, checkPasswordStrength } from "@/lib/passwordRules";
import styles from "./PasswordRulesList.module.css";

interface IPasswordRulesList {
  password: string;
  showStrengthBar?: boolean;
}

export default function PasswordRulesList({
  password,
  showStrengthBar = false,
}: IPasswordRulesList) {
  const { percent, color } = checkPasswordStrength(password);

  return (
    <div className={styles.container}>
      {showStrengthBar && (
        <div className={styles.strengthBar}>
          <div
            className={styles.strengthBarFill}
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      )}

      <ul className={styles.rulesList}>
        {PASSWORD_RULES.map((rule) => {
          const isValid = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`${styles.ruleItem} ${isValid ? styles.valid : ""}`}
            >
              <span className={styles.ruleIcon}>{isValid ? "✓" : "•"}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}