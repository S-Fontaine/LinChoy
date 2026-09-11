import {
  fieldRowClass,
  fieldRowInputClass,
  fieldRowLabelClass,
  inputClass,
  readOnlyFieldClass,
  sectionColumnClass,
  sectionHeaderClass,
} from "./Admin.styles";
import type { GameServerFormValue } from "./types";

export default function HostFields({
  value,
  onChange,
  readOnly,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
  readOnly?: boolean;
}) {
  const inputClassName = `${readOnly ? readOnlyFieldClass : inputClass} ${fieldRowInputClass}`;

  return (
    <div className={sectionColumnClass}>
      <p className={sectionHeaderClass}>Accès interne (RCON/API)</p>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Adresse</span>
        <input
          className={inputClassName}
          value={value.hostInfo.address}
          placeholder="ex : 192.0.2.1"
          disabled={readOnly}
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
          className={inputClassName}
          value={value.hostInfo.port}
          placeholder="ex : 25575"
          disabled={readOnly}
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
          className={inputClassName}
          value={value.hostInfo.password}
          placeholder="Mot de passe admin"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              hostInfo: { ...value.hostInfo, password: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Bientôt dispo.</span>
        <input
          type="checkbox"
          checked={value.statusInfo.comingSoon}
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              statusInfo: { comingSoon: e.target.checked },
            })
          }
        />
      </label>
    </div>
  );
}
