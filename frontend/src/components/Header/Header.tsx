"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppUI } from "@/context/AppUIContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import AuthCard from "../AuthCard/AuthCard";
import Modal from "../ui/Modal";

const dropdownItemClass =
  "w-full cursor-pointer rounded-lg border-0 bg-transparent px-4 py-3 text-left text-[0.95rem] text-text-high transition-all duration-300 ease-smooth hover:bg-[color-mix(in_srgb,var(--text-high)_10%,transparent)]";
const adminItemClass =
  "w-full cursor-pointer rounded-lg border-0 bg-transparent px-4 py-3 text-left text-[0.95rem] text-lin-orange transition-all duration-300 ease-smooth hover:bg-[rgba(255,140,0,0.1)]";
const dangerItemClass =
  "w-full cursor-pointer rounded-lg border-0 bg-transparent px-4 py-3 text-left text-[0.95rem] text-[#ff4d4d] transition-all duration-300 ease-smooth hover:bg-[rgba(255,77,77,0.1)]";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const {
    isOpen,
    openAuth,
    closeAuth,
    openServerStatus,
    openAccountSettings,
  } = useAppUI();
  const [isLogin, setIsLogin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onSwitchClick = () => setIsLogin(!isLogin);

  // Le layout /admin est un Server Component qui ne rafraîchit jamais le
  // accessToken lui-même (le refreshToken n'est envoyé qu'à /auth/refresh,
  // pas accessible côté serveur pour /admin) — on s'assure ici qu'un cookie
  // frais existe côté navigateur avant la navigation SSR.
  const goToAdmin = async () => {
    setIsDropdownOpen(false);
    await fetchWithAuth("/auth/me").catch(() => {});
    router.push("/admin");
  };

  const isUserLogin = () => {
    setIsLogin(true);
    openAuth();
  };

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-1000 w-full border-b border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <header className="mx-auto flex min-h-18.75 max-w-300 items-center justify-between p-5">
        <div
          className="cursor-pointer text-[clamp(1.2rem,4vw,1.5rem)] font-extrabold tracking-[-0.5px] text-text-high"
          onClick={openServerStatus}
        >
          <span className="text-lin-orange">Dra</span>
          <span className="text-choy-green">Choy</span>
        </div>
        <div>
          {!user && (
            <button
              className="flex h-11.75 cursor-pointer items-center justify-center rounded-lg border border-border bg-bg-surface px-7 text-[0.95rem] font-semibold text-text-high transition-all duration-300 ease-smooth"
              onClick={isUserLogin}
            >
              Connexion
            </button>
          )}

          {user && (
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                type="button"
                className="flex h-11.75 w-11.75 cursor-pointer items-center justify-center rounded-full border border-border bg-bg-surface text-[1.5rem] font-semibold text-text-high transition-all duration-300 ease-smooth hover:border-lin-orange"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                aria-controls="user-dropdown-menu"
                aria-label="Ouvrir le menu utilisateur"
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </button>

              {isDropdownOpen && (
                <ul
                  id="user-dropdown-menu"
                  role="menu"
                  className="absolute top-[calc(100%+10px)] right-0 z-9999 flex w-55 flex-col rounded-lg border border-border bg-bg-surface p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={dropdownItemClass}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openServerStatus?.();
                      }}
                    >
                      Statut des serveurs
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={dropdownItemClass}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openAccountSettings?.();
                      }}
                    >
                      Paramètres du compte
                    </button>
                  </li>
                  {user.role === "admin" && (
                    <>
                      <li className="my-1 h-px bg-border" role="none" />
                      <li role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className={adminItemClass}
                          onClick={goToAdmin}
                        >
                          Admin
                        </button>
                      </li>
                    </>
                  )}
                  <li className="my-1 h-px bg-border" role="none" />
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={dangerItemClass}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                    >
                      Déconnexion
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}

          <Modal
            isOpen={isOpen}
            onClose={() => {
              setIsLogin(false);
              closeAuth();
            }}
          >
            <AuthCard
              onLoginSuccess={closeAuth}
              isLogin={isLogin}
              onSwitchClick={onSwitchClick}
            />
          </Modal>
        </div>
      </header>
    </div>
  );
}
