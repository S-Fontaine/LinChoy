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

export default function ConnectionFields({
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
      <p className={sectionHeaderClass}>Connexion</p>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Adresse</span>
        <input
          className={inputClassName}
          value={value.connectionInfo.address}
          placeholder="linchoy.com"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              connectionInfo: { ...value.connectionInfo, address: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Port</span>
        <input
          type="number"
          className={inputClassName}
          value={value.connectionInfo.port}
          placeholder="ex : 25565"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              connectionInfo: { ...value.connectionInfo, port: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Mot de passe</span>
        <input
          className={inputClassName}
          value={value.connectionInfo.password}
          placeholder="Mot de passe public"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              connectionInfo: { ...value.connectionInfo, password: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Port requête</span>
        <input
          type="number"
          className={inputClassName}
          value={value.connectionInfo.queryPort}
          placeholder="ex : 25565"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              connectionInfo: { ...value.connectionInfo, queryPort: e.target.value },
            })
          }
        />
      </label>
    </div>
  );
}
