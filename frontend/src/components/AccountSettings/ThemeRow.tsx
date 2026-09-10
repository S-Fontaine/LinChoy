"use client";
import { useState } from "react";
import { rowClass, rowLabelClass, rowValueContainerClass, rowValueClass } from "./AccountSettings.styles";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import ThemeSwitch from "../ui/ThemeSwitch";

export default function ThemeRow() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function handleToggle() {
    if (!user) return;
    const nextTheme = user.theme === "light" ? "dark" : "light";
    setLoading(true);
    const previousTheme = user.theme;
    updateUser((prev) => ({ ...prev, theme: nextTheme }));

    const res = await fetchWithAuth(`/users/${user.id}/theme`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: nextTheme }),
    });

    if (!res.ok) {
      updateUser((prev) => ({ ...prev, theme: previousTheme }));
    }
    setLoading(false);
  }

  return (
    <div className={rowClass}>
      <div className={rowLabelClass}>Thème</div>
      <div className={rowValueContainerClass}>
        <span className={rowValueClass}>
          {user.theme === "light" ? "Clair" : "Sombre"}
        </span>
        <ThemeSwitch
          checked={user.theme === "light"}
          onChange={handleToggle}
          disabled={loading}
        />
      </div>
    </div>
  );
}
