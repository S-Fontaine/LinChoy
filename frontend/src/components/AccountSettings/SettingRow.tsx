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

interface ISettingRow<T> {
  label: string;
  displayValue: string;
  editLabel?: string;
  onSave: (value: T) => Promise<{ success: boolean; message: string }>;
  inputType?: string;
  emptyValue?: T;
  renderEditField?: (
    value: T,
    setValue: (v: T) => void,
  ) => React.ReactNode;
  isValid?: (value: T) => boolean;
}

export default function SettingRow<T = string>({
  label,
  displayValue,
  editLabel = "Modifier",
  onSave,
  inputType = "text",
  emptyValue = "" as T,
  renderEditField,
  isValid = (value: T) =>
    typeof value === "string" ? value.length > 0 : true,
}: ISettingRow<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<T>(emptyValue);
  const [state, setState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  function openEdit() {
    setValue(emptyValue);
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
        <form
          className="flex flex-col gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {renderEditField ? (
            renderEditField(value, setValue)
          ) : (
            <input
              type={inputType}
              className={rowInputClass}
              value={value as unknown as string}
              onChange={(e) => setValue(e.target.value as unknown as T)}
              autoFocus
            />
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={cancelBtnClass}
              onClick={() => setIsEditing(false)}
              disabled={state.loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={saveBtnClass}
              disabled={state.loading || !isValid(value)}
            >
              {state.loading ? "..." : "Enregistrer"}
            </button>
          </div>
          {state.error && <p className={errorTextClass}>{state.error}</p>}
        </form>
      )}
      {!isEditing && state.success && (
        <p className={successTextClass}>{state.success}</p>
      )}
    </div>
  );
}
