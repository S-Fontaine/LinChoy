import {
  fieldRowClass,
  fieldRowInputClass,
  fieldRowLabelClass,
  inputClass,
  sectionColumnClass,
  sectionHeaderClass,
} from "./Admin.styles";
import type { GameServerFormValue } from "./types";

export default function HostFields({
  value,
  onChange,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
}) {
  return (
    <div className={sectionColumnClass}>
      <p className={sectionHeaderClass}>Accès interne (RCON/API)</p>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Adresse</span>
        <input
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.hostInfo.address}
          placeholder="ex : 192.0.2.1"
          onChange={(e) =>
            onChange({
              ...value,
              hostInfo: { ...value.hostInfo, address: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Port</span>
        <input
          type="number"
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.hostInfo.port}
          placeholder="ex : 25575"
          onChange={(e) =>
            onChange({
              ...value,
              hostInfo: { ...value.hostInfo, port: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Mot de passe</span>
        <input
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.hostInfo.password}
          placeholder="Mot de passe RCON ou API interne"
          onChange={(e) =>
            onChange({
              ...value,
              hostInfo: { ...value.hostInfo, password: e.target.value },
            })
          }
        />
      </label>
    </div>
  );
}
