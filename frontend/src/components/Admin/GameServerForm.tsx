import {
  fieldLabelClass,
  requiredInputClass,
  sectionColumnsClass,
} from "./Admin.styles";
import ConnectionFields from "./ConnectionFields";
import ConfigurationFields from "./ConfigurationFields";
import HostFields from "./HostFields";
import PresentationFields from "./PresentationFields";
import type { GameServerFormValue } from "./types";

export default function GameServerForm({
  value,
  onChange,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className={fieldLabelClass}>
        Nom
        <input
          className={requiredInputClass(value.name.trim().length > 0)}
          value={value.name}
          placeholder="ex : Minecraft"
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </label>

      <div className={sectionColumnsClass}>
        <ConnectionFields value={value} onChange={onChange} />
        <ConfigurationFields value={value} onChange={onChange} />
        <HostFields value={value} onChange={onChange} />
      </div>

      <PresentationFields value={value} onChange={onChange} />
    </div>
  );
}
