import {
  fieldLabelClass,
  readOnlyFieldClass,
  requiredInputClass,
  sectionColumnsClass,
} from "./Admin.styles";
import ConnectionFields from "./ConnectionFields";
import ConfigurationFields from "./ConfigurationFields";
import HostFields from "./HostFields";
import PresentationFields from "./PresentationFields";
import { slugify, type GameServerFormValue } from "./types";

export default function GameServerForm({
  value,
  onChange,
  readOnly,
}: {
  value: GameServerFormValue;
  onChange: (value: GameServerFormValue) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className={fieldLabelClass}>
        Nom
        <input
          className={
            readOnly ? readOnlyFieldClass : requiredInputClass(value.name.trim().length > 0)
          }
          value={value.name}
          placeholder="Minecraft"
          disabled={readOnly}
          onChange={(e) => {
            const name = e.target.value;
            const prevSlug = slugify(value.name);
            const prevContainer = prevSlug ? `${prevSlug}-server` : "";
            const prevImage = prevSlug ? `/assets/${prevSlug}.webp` : "";
            const slug = slugify(name);
            const containerName = slug ? `${slug}-server` : "";
            const image = slug ? `/assets/${slug}.webp` : "";

            onChange({
              ...value,
              name,
              gameData: {
                ...value.gameData,
                slug: value.gameData.slug === prevSlug ? slug : value.gameData.slug,
                containerName:
                  value.gameData.containerName === prevContainer
                    ? containerName
                    : value.gameData.containerName,
              },
              serverInfo: {
                ...value.serverInfo,
                image:
                  value.serverInfo.image === prevImage
                    ? image
                    : value.serverInfo.image,
              },
            });
          }}
        />
      </label>

      <div className={sectionColumnsClass}>
        <ConnectionFields value={value} onChange={onChange} readOnly={readOnly} />
        <ConfigurationFields value={value} onChange={onChange} readOnly={readOnly} />
        <HostFields value={value} onChange={onChange} readOnly={readOnly} />
      </div>

      <PresentationFields value={value} onChange={onChange} readOnly={readOnly} />
    </div>
  );
}
