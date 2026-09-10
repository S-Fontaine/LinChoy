"use client";
import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { key: "compte", label: "Compte et sécurité", comingSoon: false },
  { key: "notifications", label: "Notifications", comingSoon: true },
  { key: "confidentialite", label: "Confidentialité", comingSoon: true },
];

const navItemBaseClass =
  "flex items-center justify-between gap-2 rounded-lg border-0 px-3.5 py-3 text-left text-[0.95rem] transition-all duration-300 ease-smooth not-disabled:hover:bg-bg-input not-disabled:hover:text-text-high";
const navItemDangerClass =
  "mt-auto flex cursor-pointer items-center justify-between gap-2 rounded-lg border-0 bg-transparent px-3.5 py-3 text-left text-[0.95rem] text-danger transition-all duration-300 ease-smooth hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]";
const soonTagClass =
  "rounded-full border border-border px-2 py-0.5 text-[0.65rem] text-text-low uppercase";
const mobileNavItemBaseClass =
  "flex w-full items-center justify-between gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-[0.9rem] cursor-pointer";
const mobileNavItemClass = `${mobileNavItemBaseClass} text-text-medium not-disabled:hover:bg-bg-input not-disabled:hover:text-text-high disabled:cursor-not-allowed disabled:text-text-low`;
const mobileNavItemDangerClass = `${mobileNavItemBaseClass} text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]`;

export default function SettingsNav({
  activeSection,
  onSectionChange,
  onDeleteClick,
}: {
  activeSection: string;
  onSectionChange: (key: string) => void;
  onDeleteClick: () => void;
}) {
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const activeItem = NAV_ITEMS.find((item) => item.key === activeSection);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node)
      ) {
        setIsMobileNavOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMobileNavOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="relative hidden max-sm:block" ref={mobileNavRef}>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-border bg-bg-input px-4 py-3 text-[0.95rem] font-semibold text-text-high"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-haspopup="menu"
          aria-expanded={isMobileNavOpen}
        >
          {activeItem?.label}
          <span
            className={`text-text-low transition-transform duration-200 ease-[ease] ${isMobileNavOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {isMobileNavOpen && (
          <ul
            role="menu"
            className="absolute top-[calc(100%+8px)] right-0 left-0 z-30 rounded-[10px] border border-border bg-bg-main p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.key} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={mobileNavItemClass}
                  disabled={item.comingSoon}
                  onClick={() => {
                    onSectionChange(item.key);
                    setIsMobileNavOpen(false);
                  }}
                >
                  {item.label}
                  {item.comingSoon && (
                    <span className={soonTagClass}>Bientôt</span>
                  )}
                </button>
              </li>
            ))}
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={mobileNavItemDangerClass}
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onDeleteClick();
                }}
              >
                Supprimer le compte
              </button>
            </li>
          </ul>
        )}
      </div>
      <nav className="flex min-w-55 flex-col border-r border-border pr-4 max-sm:hidden">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`${navItemBaseClass} ${
              activeSection === item.key
                ? "bg-bg-input font-semibold text-choy-green"
                : "bg-transparent text-text-medium"
            } ${item.comingSoon ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            onClick={() => !item.comingSoon && onSectionChange(item.key)}
            disabled={item.comingSoon}
          >
            {item.label}
            {item.comingSoon && <span className={soonTagClass}>Bientôt</span>}
          </button>
        ))}
        <button className={navItemDangerClass} onClick={onDeleteClick}>
          Supprimer le compte
        </button>
      </nav>
    </>
  );
}
