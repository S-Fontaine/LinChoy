"use client";
import { useState } from "react";
import { layoutClass, contentClass, contentTitleClass } from "./AccountSettings.styles";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { checkPasswordStrength } from "@/lib/passwordRules";
import SettingRow from "./SettingRow";
import PasswordEditField, {
  emptyPasswordFormValue,
  type PasswordFormValue,
} from "./PasswordEditField";
import ValueWithPasswordField, {
  emptyValueWithPassword,
  type ValueWithPassword,
} from "./ValueWithPasswordField";
import SettingsNav from "./SettingsNav";
import SteamLinkRow from "./SteamLinkRow";
import MinecraftLinkRow from "./MinecraftLinkRow";
import ThemeRow from "./ThemeRow";
import DeleteAccountModal from "./DeleteAccountModal";

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("compte");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!user) return null;

  async function patchUser(
    payload: Record<string, string>,
    currentPassword: string,
  ) {
    if (!user) return { success: false, message: "Utilisateur non connecté" };
    const res = await fetchWithAuth(`/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, currentPassword }),
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

  async function patchPassword(value: PasswordFormValue) {
    if (!user) return { success: false, message: "Utilisateur non connecté" };
    const res = await fetchWithAuth(`/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: value.currentPassword,
        password: value.newPassword,
      }),
    });
    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Une erreur est survenue",
      };
    }

    return { success: true, message: result.message };
  }

  return (
    <div className={layoutClass}>
      <SettingsNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onDeleteClick={() => setIsDeleteOpen(true)}
      />

      <div className={contentClass}>
        {activeSection === "compte" && (
          <>
            <h2 className={contentTitleClass}>Compte et sécurité</h2>

            <SettingRow<ValueWithPassword>
              label="Nom d'utilisateur"
              displayValue={user.username}
              emptyValue={emptyValueWithPassword}
              onSave={(v) => patchUser({ username: v.value }, v.currentPassword)}
              isValid={(v) => v.value.length > 0 && v.currentPassword.length > 0}
              renderEditField={(v, setV) => (
                <ValueWithPasswordField
                  value={v}
                  setValue={setV}
                  email={user.email}
                  placeholder="Nouveau nom d'utilisateur"
                />
              )}
            />

            <SettingRow<ValueWithPassword>
              label="Adresse Email"
              displayValue={user.email}
              emptyValue={emptyValueWithPassword}
              onSave={(v) => patchUser({ email: v.value }, v.currentPassword)}
              isValid={(v) => v.value.length > 0 && v.currentPassword.length > 0}
              renderEditField={(v, setV) => (
                <ValueWithPasswordField
                  value={v}
                  setValue={setV}
                  email={user.email}
                  inputType="email"
                  placeholder="Nouvelle adresse email"
                />
              )}
            />

            <SettingRow<PasswordFormValue>
              label="Mot de passe"
              displayValue="••••••••••••"
              editLabel="Changer"
              emptyValue={emptyPasswordFormValue}
              onSave={patchPassword}
              isValid={(value) =>
                value.currentPassword.length > 0 &&
                checkPasswordStrength(value.newPassword).isComplete &&
                value.newPassword === value.confirmPassword
              }
              renderEditField={(value, setValue) => (
                <PasswordEditField
                  value={value}
                  setValue={setValue}
                  email={user.email}
                />
              )}
            />

            <SteamLinkRow />
            <MinecraftLinkRow />
            <ThemeRow />
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
