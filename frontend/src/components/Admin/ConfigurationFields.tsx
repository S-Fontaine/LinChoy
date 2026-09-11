import {
  fieldRowClass,
  fieldRowInputClass,
  fieldRowLabelClass,
  inputClass,
  readOnlyFieldClass,
  requiredInputClass,
  sectionColumnClass,
  sectionHeaderClass,
} from "./Admin.styles";
import type { GameServerFormValue, GameServerType } from "./types";

const GAME_TYPES: GameServerType[] = ["palworld", "minecraft", "protocol-valve"];

export default function ConfigurationFields({
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
      <p className={sectionHeaderClass}>Configuration</p>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Joueurs max.</span>
        <input
          type="number"
          className={inputClassName}
          value={value.playerInfo.maxPlayers}
          placeholder="ex : 10"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              playerInfo: { maxPlayers: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Type de jeu</span>
        <select
          className={inputClassName}
          value={value.gameData.type}
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              gameData: {
                ...value.gameData,
                type: e.target.value as GameServerType,
              },
            })
          }
        >
          {GAME_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Conteneur</span>
        <input
          className={`${
            readOnly
              ? readOnlyFieldClass
              : requiredInputClass(value.gameData.containerName.trim().length > 0)
          } ${fieldRowInputClass}`}
          value={value.gameData.containerName}
          placeholder="minecraft-server"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              gameData: { ...value.gameData, containerName: e.target.value },
            })
          }
        />
      </label>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Slug</span>
        <input
          className={`${
            readOnly
              ? readOnlyFieldClass
              : requiredInputClass(value.gameData.slug.trim().length > 0)
          } ${fieldRowInputClass}`}
          value={value.gameData.slug}
          placeholder="minecraft"
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              ...value,
              gameData: { ...value.gameData, slug: e.target.value },
            })
          }
        />
      </label>
    </div>
  );
}
