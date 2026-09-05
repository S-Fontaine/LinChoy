export const PASSWORD_RULES = [
  { label: "Au moins 12 caractères", test: (pwd: string) => pwd.length >= 12 },
  { label: "Une majuscule", test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: "Un caractère spécial", test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd) },
];