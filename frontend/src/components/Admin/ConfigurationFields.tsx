import {
  fieldRowClass,
  fieldRowInputClass,
  fieldRowLabelClass,
  inputClass,
  requiredInputClass,
  sectionColumnClass,
  sectionHeaderClass,
} from "./Admin.styles";
import type { GameServerFormValue, GameServerType } from "./types";

const GAME_TYPES: GameServerType[] = ["palworld", "minecraft", "protocol-valve"];

export default function ConfigurationFields({
  value,
  onChange,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
}) {
  return (
    <div className={sectionColumnClass}>
      <p className={sectionHeaderClass}>Configuration</p>
      <label className={fieldRowClass}>
        <span className={fieldRowLabelClass}>Joueurs max.</span>
        <input
          type="number"
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.playerInfo.maxPlayers}
          placeholder="ex : 10"
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
          className={`${inputClass} ${fieldRowInputClass}`}
          value={value.gameData.type}
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
          className={`${requiredInputClass(
            value.gameData.containerName.trim().length > 0,
          )} ${fieldRowInputClass}`}
          value={value.gameData.containerName}
          placeholder="ex : minecraft-server"
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
          className={`${requiredInputClass(value.gameData.slug.trim().length > 0)} ${fieldRowInputClass}`}
          value={value.gameData.slug}
          placeholder="ex : minecraft-hard"
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
