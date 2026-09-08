"use client";
import { useState } from "react";
import {
  rowClass,
  rowLabelClass,
  rowValueContainerClass,
  rowValueClass,
  modifyBtnClass,
  rowInputClass,
  errorTextClass,
} from "./AccountSettings.styles";

const cancelBtnClass =
  "cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2 text-text-medium disabled:cursor-not-allowed disabled:opacity-50";
const saveBtnClass =
  "cursor-pointer rounded-lg border-0 bg-choy-green px-4 py-2 font-semibold text-bg-main disabled:cursor-not-allowed disabled:opacity-50";
const successTextClass = "text-[0.85rem] text-choy-green";

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
  isValid?: (value: string) => boolean;
}

export default function SettingRow({
  label,
  displayValue,
  editLabel = "Modifier",
  onSave,
  inputType = "text",
  renderEditField,
  isValid = (value) => value.length > 0,
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
    <div className={rowClass}>
      <div className={rowLabelClass}>{label}</div>

      {!isEditing ? (
        <div className={rowValueContainerClass}>
          <span className={rowValueClass}>{displayValue}</span>
          <button className={modifyBtnClass} onClick={openEdit}>
            {editLabel}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {renderEditField ? (
            renderEditField(value, setValue)
          ) : (
            <input
              type={inputType}
              className={rowInputClass}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          )}
          <div className="flex justify-end gap-2">
            <button
              className={cancelBtnClass}
              onClick={() => setIsEditing(false)}
              disabled={state.loading}
            >
              Annuler
            </button>
            <button
              className={saveBtnClass}
              onClick={handleSave}
              disabled={state.loading || !isValid(value)}
            >
              {state.loading ? "..." : "Enregistrer"}
            </button>
          </div>
          {state.error && <p className={errorTextClass}>{state.error}</p>}
        </div>
      )}
      {!isEditing && state.success && (
        <p className={successTextClass}>{state.success}</p>
      )}
    </div>
  );
}
