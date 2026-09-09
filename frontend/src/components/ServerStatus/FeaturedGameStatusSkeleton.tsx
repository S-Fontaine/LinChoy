"use client";

const shimmerClass =
  "animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,var(--border)_25%,color-mix(in_srgb,var(--border)_60%,transparent)_50%,var(--border)_75%)] bg-size-[200%_100%]";
const lineClass = `rounded ${shimmerClass}`;

export function FeaturedGameStatusSkeleton() {
  return (
    <div className="flex h-[clamp(450px,calc(1409px-140vw),929px)] overflow-hidden rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] max-[700px]:flex-col">
      <div
        className={`min-h-70 flex-[0_0_40%] max-[700px]:h-50 max-[700px]:flex-none ${shimmerClass}`}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-8 py-7">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2.5">
            <div className={lineClass} style={{ width: "80px", height: "12px" }} />
            <div className={lineClass} style={{ width: "220px", height: "24px" }} />
          </div>
          <div
            className={lineClass}
            style={{ width: "24px", height: "24px", borderRadius: "50%" }}
          />
        </div>

        <div className="flex justify-between">
          <div className={lineClass} style={{ width: "100px", height: "16px" }} />
          <div className={lineClass} style={{ width: "90px", height: "16px" }} />
        </div>

        <div className={lineClass} style={{ width: "100%", height: "14px" }} />
        <div className={lineClass} style={{ width: "70%", height: "14px" }} />

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <div className={lineClass} style={{ width: "120px", height: "12px" }} />
          <div className="flex gap-2">
            <div className={`h-7.5 w-22.5 rounded-full ${shimmerClass}`} />
            <div className={`h-7.5 w-22.5 rounded-full ${shimmerClass}`} />
            <div className={`h-7.5 w-22.5 rounded-full ${shimmerClass}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
