"use client";
import { useState } from "react";
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
  const [activeSection, setActiveSection] = useState("compte");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteState, setDeleteState] = useState({ loading: false, error: "" });

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

  return (
    <div className={styles.layout}>
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
              onSave={(value) => patchUser({ username: value })}
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
          </>
        )}
      </div>

      <Modal
        isAuthOpen={isDeleteOpen}
        onCloseAuth={() => setIsDeleteOpen(false)}
      >
        <form onSubmit={handleDelete} className={signStyles.form}>
          <h2 className={styles.contentTitle}>Confirmer la suppression</h2>
          <p className={styles.dangerText}>
            Entre ton mot de passe pour confirmer. Cette action est définitive.
          </p>
          <div className={signStyles.inputGroup}>
            <label className={signStyles.label}>Mot de passe</label>
            <input
              type="password"
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
