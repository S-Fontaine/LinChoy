export interface PasswordRule {
  label: string;
  test: (pwd: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "Au moins 12 caractères", test: (pwd: string) => pwd.length >= 12 },
  { label: "Une majuscule", test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: "Un caractère spécial", test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
];

export function checkPasswordStrength(password: string) {
  const validCount = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const isComplete = validCount === PASSWORD_RULES.length;
  const percent = (validCount / PASSWORD_RULES.length) * 100;

  const color =
    validCount === 0
      ? "var(--border)"
      : isComplete
        ? "var(--choy-green)"
        : validCount === 2
          ? "var(--lin-orange)"
          : "#e04b4b";

  return { validCount, isComplete, percent, color };
}