import { sunIcon, moonIcon } from "../icons/Icons";

export default function ThemeSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Passer en thème sombre" : "Passer en thème clair"}
      onClick={onChange}
      disabled={disabled}
      className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full border border-border transition-colors duration-300 ease-smooth disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-switch-light" : "bg-switch-dark"
      }`}
    >
      <span
        className={`absolute top-0.75 left-0.75 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-smooth ${
          checked ? "translate-x-6 text-switch-light" : "translate-x-0 text-switch-dark"
        }`}
      >
        {checked ? sunIcon : moonIcon}
      </span>
    </button>
  );
}
