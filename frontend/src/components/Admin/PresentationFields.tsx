import {
  fieldLabelClass,
  inputClass,
  readOnlyFieldClass,
  sectionHeaderClass,
} from "./Admin.styles";
import type { GameServerFormValue } from "./types";

export default function PresentationFields({
  value,
  onChange,
  readOnly,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
  readOnly?: boolean;
}) {
  return (
    <>
      <p className={sectionHeaderClass}>Présentation</p>
      <label className={fieldLabelClass}>
        Image
        <input
          className={readOnly ? readOnlyFieldClass : inputClass}
          value={value.serverInfo.image}
          disabled={readOnly}
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
          className={`${readOnly ? readOnlyFieldClass : inputClass} min-h-48 resize-none`}
          value={value.serverInfo.description}
          placeholder="Courte description affichée sur la page du serveur"
          maxLength={250}
          disabled={readOnly}
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
