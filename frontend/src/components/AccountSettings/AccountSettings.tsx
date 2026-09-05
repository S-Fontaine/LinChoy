"use client";
import { useState } from "react";
import styles from "./AccountSettings.module.css";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import SettingRow from "./SettingRow";
import PasswordEditField from "./PasswordEditField";
import SettingsNav from "./SettingsNav";
import SteamLinkRow from "./SteamLinkRow";
import MinecraftLinkRow from "./MinecraftLinkRow";
import DeleteAccountModal from "./DeleteAccountModal";

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("compte");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!user) return null;

  async function patchUser(payload: Record<string, string>) {
    if (!user) return { success: false, message: "Utilisateur non connecté" };
    const res = await fetchWithAuth(`/users/${user.id}`, {
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

    updateUser((prev) => ({
      ...prev,
      id: result.data.id,
      username: result.data.username,
      email: result.data.email,
    }));
    return { success: true, message: result.message };
  }

  return (
    <div className={styles.layout}>
      <SettingsNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onDeleteClick={() => setIsDeleteOpen(true)}
      />

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

            <SteamLinkRow />
            <MinecraftLinkRow />
          </>
        )}
      </div>

      <DeleteAccountModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
