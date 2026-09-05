"use client";
import { useState } from "react";
import shared from "./AccountSettings.module.css";
import styles from "./SettingRow.module.css";

interface ISettingRow {
  label: string;
  displayValue: string;
  editLabel?: string;
  onSave: (value: string) => Promise<{ success: boolean; message: string }>;
  inputType?: string;
  renderEditField?: (
    value: string,
    setValue: (v: string) => void,
  ) => React.ReactNode;
}

export default function SettingRow({
  label,
  displayValue,
  editLabel = "Modifier",
  onSave,
  inputType = "text",
  renderEditField,
}: ISettingRow) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [state, setState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  function openEdit() {
    setValue("");
    setState({ loading: false, error: "", success: "" });
    setIsEditing(true);
  }

  async function handleSave() {
    setState({ loading: true, error: "", success: "" });
    const result = await onSave(value);
    if (result.success) {
      setState({ loading: false, error: "", success: result.message });
      setIsEditing(false);
    } else {
      setState({ loading: false, error: result.message, success: "" });
    }
  }

  return (
    <div className={shared.row}>
      <div className={shared.rowLabel}>{label}</div>

      {!isEditing ? (
        <div className={shared.rowValueContainer}>
          <span className={shared.rowValue}>{displayValue}</span>
          <button className={shared.modifyBtn} onClick={openEdit}>
            {editLabel}
          </button>
        </div>
      ) : (
        <div className={styles.rowEditContainer}>
          {renderEditField ? (
            renderEditField(value, setValue)
          ) : (
            <input
              type={inputType}
              className={shared.rowInput}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          )}
          <div className={styles.rowActions}>
            <button
              className={styles.cancelBtn}
              onClick={() => setIsEditing(false)}
              disabled={state.loading}
            >
              Annuler
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={state.loading || value.length === 0}
            >
              {state.loading ? "..." : "Enregistrer"}
            </button>
          </div>
          {state.error && <p className={shared.errorText}>{state.error}</p>}
        </div>
      )}
      {!isEditing && state.success && (
        <p className={styles.successText}>{state.success}</p>
      )}
    </div>
  );
}
