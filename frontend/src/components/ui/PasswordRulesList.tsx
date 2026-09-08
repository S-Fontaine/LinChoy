"use client";
import { PASSWORD_RULES, checkPasswordStrength } from "@/lib/passwordRules";

const ruleItemBaseClass =
  "flex items-center gap-1.5 text-[0.75rem] transition-colors duration-200 ease-[ease]";

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
    <div className="flex w-full flex-col gap-2">
      {showStrengthBar && (
        <div className="h-1 w-full overflow-hidden rounded-sm bg-border">
          <div
            className="h-full transition-[width,background-color] duration-300 ease-[ease]"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      )}

      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {PASSWORD_RULES.map((rule) => {
          const isValid = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`${ruleItemBaseClass} ${isValid ? "text-choy-green" : "text-text-low"}`}
            >
              <span className="text-[0.85rem] leading-none font-bold">
                {isValid ? "✓" : "•"}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
