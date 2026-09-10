import {
  fieldRowClass,
  fieldRowInputClass,
  fieldRowLabelClass,
  inputClass,
  sectionColumnClass,
  sectionHeaderClass,
} from "./Admin.styles";
import type { GameServerFormValue } from "./types";

export default function ConnectionFields({
  value,
  onChange,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
}) {
  return (
    <div className={sectionColumnClass}>
      <p className={sectionHeaderClass}>Connexion</p>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Adresse</span>
        <input
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.connectionInfo.address}
          placeholder="linchoy.com"
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
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.connectionInfo.port}
          placeholder="ex : 25565"
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
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.connectionInfo.password}
          placeholder="Mot de passe pour rejoindre le serveur"
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
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.connectionInfo.queryPort}
          placeholder="ex : 25565"
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
