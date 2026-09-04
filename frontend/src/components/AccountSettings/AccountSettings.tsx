"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./AccountSettings.module.css";
import signStyles from "../AuthCard/Sign.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Modal from "../ui/Modal";
import SettingRow from "./SettingRow";

const PASSWORD_RULES = [
  { label: "Au moins 12 caractères", test: (pwd: string) => pwd.length >= 12 },
  { label: "Une majuscule", test: (pwd: string) => /[A-Z]/.test(pwd) },
  {
    label: "Un caractère spécial",
    test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
  },
];

const NAV_ITEMS = [
  { key: "compte", label: "Compte et sécurité", comingSoon: false },
  { key: "notifications", label: "Notifications", comingSoon: true },
  { key: "confidentialite", label: "Confidentialité", comingSoon: true },
];

export default function AccountSettings() {
  const { user, setUser, logout } = useAuth();
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("compte");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteState, setDeleteState] = useState({ loading: false, error: "" });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [steamMessage, setSteamMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [minecraftInput, setMinecraftInput] = useState("");
  const [minecraftLoading, setMinecraftLoading] = useState(false);
  const [minecraftMessage, setMinecraftMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [mcUnlinkLoading, setMcUnlinkLoading] = useState(false);
  const [showMinecraftForm, setShowMinecraftForm] = useState(false);

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

  const activeItem = NAV_ITEMS.find((item) => item.key === activeSection);
  if (!user) return null;

  async function patchUser(payload: Record<string, string>) {
    const res = await fetchWithAuth(`/users/${user!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Une erreur est survenue",
      };
    }

    setUser({
      id: result.data.id,
      username: result.data.username,
      email: result.data.email,
      favoriteServer: user!.favoriteServer,
      steamId: user!.steamId,
      minecraftUuid: user!.minecraftUuid,
      minecraftUsername: user!.minecraftUsername,
      minecraftVerified: user!.minecraftVerified,
    });
    return { success: true, message: result.message };
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleteState({ loading: true, error: "" });

    try {
      const res = await fetchWithAuth(`/users/${user!.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!res.ok) {
        const result = await res.json();
        setDeleteState({
          loading: false,
          error: result.message || "Une erreur est survenue",
        });
        return;
      }

      await logout();
    } catch {
      setDeleteState({ loading: false, error: "Erreur réseau, réessayez." });
    }
  }

  async function handleUnlinkSteam() {
    setUnlinkLoading(true);
    try {
      const res = await fetchWithAuth(`/steam/link`, { method: "DELETE" });
      if (res.ok) {
        setUser({ ...user!, steamId: null });
      }
    } finally {
      setUnlinkLoading(false);
    }
  }
  function handleLinkSteam() {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/steam/link`,
      "steamLink",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    if (!popup) {
      setSteamMessage({
        type: "error",
        text: "Ton navigateur a bloqué la fenêtre. Autorise les popups pour ce site.",
      });
      return;
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== process.env.NEXT_PUBLIC_BACKEND_URL) return;
      if (event.data?.type !== "steam-link") return;

      if (event.data.success) {
        setUser({ ...user!, steamId: event.data.steamId });
        setSteamMessage({
          type: "success",
          text: "Compte Steam lié avec succès !",
        });
      } else {
        const errorMessages: Record<string, string> = {
          session_expired:
            "Ta session a expiré pendant la vérification, réessaie.",
          already_linked:
            "Ce compte Steam est déjà lié à un autre utilisateur.",
          invalid: "La vérification Steam a échoué, réessaie.",
        };
        setSteamMessage({
          type: "error",
          text: errorMessages[event.data.error] || "Une erreur est survenue.",
        });
      }

      window.removeEventListener("message", handleMessage);
    }

    window.addEventListener("message", handleMessage);
  }
  async function handleLinkMinecraft(e: React.FormEvent) {
    e.preventDefault();
    if (!minecraftInput.trim()) return;
    setMinecraftLoading(true);
    setMinecraftMessage(null);
    try {
      const res = await fetchWithAuth(`/minecraft/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: minecraftInput.trim() }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMinecraftMessage({
          type: "error",
          text: result.message || "Une erreur est survenue",
        });
        return;
      }
      setUser({
        ...user!,
        minecraftUuid: result.minecraftUuid,
        minecraftUsername: result.minecraftUsername,
        minecraftVerified: result.minecraftVerified,
      });
      setMinecraftInput("");
      setMinecraftMessage({
        type: "success",
        text: "Compte Minecraft lié avec succès !",
      });
      setShowMinecraftForm(false);
    } catch {
      setMinecraftMessage({ type: "error", text: "Erreur réseau, réessaie." });
    } finally {
      setMinecraftLoading(false);
    }
  }
  async function handleUnlinkMinecraft() {
    setMcUnlinkLoading(true);
    try {
      const res = await fetchWithAuth(`/minecraft/link`, { method: "DELETE" });
      if (res.ok) {
        setUser({
          ...user!,
          minecraftUuid: null,
          minecraftUsername: null,
          minecraftVerified: false,
        });
        setShowMinecraftForm(false);
      }
    } finally {
      setMcUnlinkLoading(false);
    }
  }
  return (
    <div className={styles.layout}>
      <div className={styles.mobileNav} ref={mobileNavRef}>
        <button
          type="button"
          className={styles.mobileNavTrigger}
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          aria-haspopup="menu"
          aria-expanded={isMobileNavOpen}
        >
          {activeItem?.label}
          <span
            className={`${styles.chevron} ${isMobileNavOpen ? styles.chevronOpen : ""}`}
          >
            ▾
          </span>
        </button>

        {isMobileNavOpen && (
          <ul role="menu" className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.key} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={styles.mobileNavItem}
                  disabled={item.comingSoon}
                  onClick={() => {
                    setActiveSection(item.key);
                    setIsMobileNavOpen(false);
                  }}
                >
                  {item.label}
                  {item.comingSoon && (
                    <span className={styles.soonTag}>Bientôt</span>
                  )}
                </button>
              </li>
            ))}
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.mobileNavItemDanger}
                onClick={() => {
                  setIsMobileNavOpen(false);
                  setIsDeleteOpen(true);
                }}
              >
                Supprimer le compte
              </button>
            </li>
          </ul>
        )}
      </div>
      <nav className={styles.sidebar}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`${styles.navItem} ${
              activeSection === item.key ? styles.navItemActive : ""
            } ${item.comingSoon ? styles.navItemDisabled : ""}`}
            onClick={() => !item.comingSoon && setActiveSection(item.key)}
            disabled={item.comingSoon}
          >
            {item.label}
            {item.comingSoon && <span className={styles.soonTag}>Bientôt</span>}
          </button>
        ))}
        <button
          className={`${styles.navItem} ${styles.navItemDanger}`}
          onClick={() => setIsDeleteOpen(true)}
        >
          Supprimer le compte
        </button>
      </nav>

      <div className={styles.content}>
        {activeSection === "compte" && (
          <>
            <h2 className={styles.contentTitle}>Compte et sécurité</h2>

            <SettingRow
              label="Nom d'utilisateur"
              displayValue={user.username}
              onSave={(value) =>
                patchUser({
                  username: value,
                })
              }
            />

            <SettingRow
              label="Adresse Email"
              displayValue={user.email}
              inputType="email"
              onSave={(value) => patchUser({ email: value })}
            />

            <SettingRow
              label="Mot de passe"
              displayValue="••••••••••••"
              editLabel="Changer"
              onSave={(value) => patchUser({ password: value })}
              renderEditField={(value, setValue) => (
                <PasswordEditField value={value} setValue={setValue} />
              )}
            />
            <div className={styles.row}>
              <div className={styles.rowLabel}>Compte Steam</div>
              <div className={styles.rowValueContainer}>
                <span className={styles.rowValue}>
                  {user.steamId ? user.steamId : "Non lié"}
                </span>
                {user.steamId ? (
                  <button
                    className={styles.modifyBtn}
                    onClick={handleUnlinkSteam}
                    disabled={unlinkLoading}
                  >
                    {unlinkLoading ? "..." : "Délier"}
                  </button>
                ) : (
                  <button
                    className={styles.modifyBtn}
                    onClick={handleLinkSteam}
                  >
                    Lier mon compte Steam
                  </button>
                )}
              </div>
              {steamMessage && (
                <div
                  className={
                    steamMessage.type === "success"
                      ? styles.successBox
                      : styles.errorBox
                  }
                >
                  <span>{steamMessage.text}</span>
                  <button
                    type="button"
                    onClick={() => setSteamMessage(null)}
                    aria-label="Fermer le message"
                    className={styles.closeMessageBtn}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className={styles.row}>
              <div className={styles.rowLabel}>Compte Minecraft</div>
              <div className={styles.rowValueContainer}>
                <span className={styles.rowValue}>
                  {user.minecraftUsername
                    ? user.minecraftVerified
                      ? user.minecraftUsername
                      : `${user.minecraftUsername} (en attente de connexion)`
                    : "Non lié"}
                </span>
                {user.minecraftUsername ? (
                  <button
                    className={styles.modifyBtn}
                    onClick={handleUnlinkMinecraft}
                    disabled={mcUnlinkLoading}
                  >
                    {mcUnlinkLoading ? "..." : "Délier"}
                  </button>
                ) : !showMinecraftForm ? (
                  <button
                    className={styles.modifyBtn}
                    onClick={() => setShowMinecraftForm(true)}
                    aria-expanded={showMinecraftForm}
                  >
                    Lier mon compte Minecraft
                  </button>
                ) : null}
              </div>

              {!user.minecraftUsername && showMinecraftForm && (
                <form
                  onSubmit={handleLinkMinecraft}
                  className={signStyles.inputGroup}
                >
                  <label
                    className={signStyles.label}
                    htmlFor="minecraft-link-input"
                  >
                    Pseudo ou UUID Minecraft
                  </label>
                  <input
                    type="text"
                    id="minecraft-link-input"
                    className={signStyles.input}
                    value={minecraftInput}
                    onChange={(e) => setMinecraftInput(e.target.value)}
                    placeholder="Notch ou 069a79f4-44e9-4726-a5be-fca90e38aaf5"
                    disabled={minecraftLoading}
                    autoFocus
                  />
                  <div className={styles.formActions}>
                    <button
                      type="submit"
                      className={styles.modifyBtn}
                      disabled={minecraftLoading || !minecraftInput.trim()}
                    >
                      {minecraftLoading ? "..." : "Lier"}
                    </button>
                    <button
                      type="button"
                      className={styles.modifyBtn}
                      onClick={() => {
                        setShowMinecraftForm(false);
                        setMinecraftInput("");
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {minecraftMessage && (
                <div
                  className={
                    minecraftMessage.type === "success"
                      ? styles.successBox
                      : styles.errorBox
                  }
                >
                  <span>{minecraftMessage.text}</span>
                  <button
                    type="button"
                    onClick={() => setMinecraftMessage(null)}
                    aria-label="Fermer le message"
                    className={styles.closeMessageBtn}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <form onSubmit={handleDelete} className={signStyles.form}>
          <h2 className={styles.contentTitle}>Confirmer la suppression</h2>
          <p className={styles.dangerText}>
            Entre ton mot de passe pour confirmer. Cette action est définitive.
          </p>
          <div className={signStyles.inputGroup}>
            <label
              className={signStyles.label}
              htmlFor="account-delete-password"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="account-delete-password"
              className={signStyles.input}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
          </div>
          {deleteState.error && (
            <p className={styles.errorText}>{deleteState.error}</p>
          )}
          <button
            type="submit"
            className={styles.dangerBtn}
            disabled={deleteState.loading || deletePassword.length === 0}
          >
            {deleteState.loading
              ? "Suppression..."
              : "Confirmer la suppression"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function PasswordEditField({
  value,
  setValue,
}: {
  value: string;
  setValue: (v: string) => void;
}) {
  const validCount = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  return (
    <div className={styles.passwordEditWrapper}>
      <input
        type="password"
        className={styles.rowInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nouveau mot de passe"
        autoFocus
      />
      <ul className={signStyles.passwordRules}>
        {PASSWORD_RULES.map((rule) => {
          const isValid = rule.test(value);
          return (
            <li
              key={rule.label}
              className={`${signStyles.ruleItem} ${isValid ? signStyles.valid : ""}`}
            >
              <span className={signStyles.ruleIcon}>{isValid ? "✓" : "•"}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
      {value.length > 0 && validCount < PASSWORD_RULES.length && (
        <p className={styles.hintText}>
          Le mot de passe doit respecter toutes les règles ci-dessus.
        </p>
      )}
    </div>
  );
}
