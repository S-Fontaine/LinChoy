import { fieldLabelClass, inputClass, sectionHeaderClass } from "./Admin.styles";
import type { GameServerFormValue } from "./types";

export default function PresentationFields({
  value,
  onChange,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
}) {
  return (
    <>
      <p className={sectionHeaderClass}>Présentation</p>
      <label className={fieldLabelClass}>
        Image
        <input
          className={inputClass}
          value={value.serverInfo.image}
          onChange={(e) =>
            onChange({
              ...value,
              serverInfo: { ...value.serverInfo, image: e.target.value },
            })
          }
          placeholder="/assets/minecraft.webp"
        />
      </label>

      <label className={fieldLabelClass}>
        Description
        <textarea
          className={`${inputClass} min-h-20 resize-y`}
          value={value.serverInfo.description}
          placeholder="Courte description affichée sur la page du serveur"
          onChange={(e) =>
            onChange({
              ...value,
              serverInfo: { ...value.serverInfo, description: e.target.value },
            })
          }
        />
      </label>
    </>
  );
}
