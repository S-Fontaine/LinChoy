export const pageWrapperClass =
  "flex h-[calc(100dvh-5.5rem)] items-center justify-center px-8 py-8 max-sm:px-4 max-sm:py-4";

export const shellClass =
  "relative flex h-full w-full max-w-312.5 overflow-hidden rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

export const sidebarClass =
  "flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border px-3 py-6 max-sm:w-56";

export const backLinkClass =
  "mb-3 inline-flex items-center gap-1 px-1 text-[0.85rem] text-text-low transition-colors duration-300 ease-smooth hover:text-text-high";

export const sidebarHeaderClass = "mb-3 flex items-center justify-between px-1";

export const pageTitleClass = "text-[1.1rem] text-text-high";

export const adminBadgeClass =
  "rounded-full border border-lin-orange bg-[rgba(255,140,0,0.1)] px-2.5 py-1 text-[0.7rem] font-bold tracking-wider text-lin-orange uppercase";

export const newRowClass =
  "mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border-l-4 px-3 py-2.5 text-left text-[0.9rem] font-semibold transition-all duration-300 ease-smooth";

export const listRowBaseClass =
  "flex w-full items-center gap-2 rounded-lg border-l-4 px-3 py-2.5 text-[0.9rem] transition-all duration-300 ease-smooth";

export const rowActionsClass = "flex shrink-0 items-center gap-1";

export const rowActionBtnClass =
  "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-text-low transition-colors duration-300 ease-smooth disabled:cursor-not-allowed disabled:opacity-40";

export const listRowActiveClass =
  "border-l-lin-orange bg-[rgba(255,140,0,0.1)] text-text-high";

export const listRowInactiveClass =
  "border-l-transparent text-text-low hover:bg-[color-mix(in_srgb,var(--text-high)_6%,transparent)]";

export const newRowInactiveClass =
  "border-l-transparent text-lin-orange hover:bg-[rgba(255,140,0,0.08)]";

export const detailPanelClass = "flex min-w-0 flex-1 flex-col overflow-y-auto p-8";

export const detailHeaderClass = "mb-4 flex items-center justify-between gap-3";

export const detailTitleRowClass = "flex min-w-0 items-center gap-2.5";

export const detailTitleClass = "truncate text-[1.2rem] text-text-high";

export const typeBadgeClass =
  "shrink-0 rounded-[20px] border border-border bg-[rgba(255,255,255,0.05)] px-2.5 py-1 text-[0.75rem] font-semibold text-text-low";

export const sectionHeaderClass =
  "mt-1 text-[0.7rem] font-bold tracking-wider text-[#aaa] uppercase";

export const fieldGridClass = "grid grid-cols-2 gap-3 max-sm:grid-cols-1";

export const sectionColumnsClass = "grid grid-cols-3 gap-6 max-sm:grid-cols-1";

export const sectionColumnClass = "flex flex-col gap-3";

export const fieldLabelClass = "flex flex-col gap-1 text-[0.8rem] text-text-low";

export const fieldRowClass = "flex items-center gap-2 text-[0.8rem] text-text-low";

export const fieldRowLabelClass = "w-28 shrink-0";

export const fieldRowInputClass = "min-w-0 flex-1";

export const inputClass =
  "rounded-lg border border-border bg-bg-input px-3 py-2 text-[0.95rem] text-text-high";

export function requiredInputClass(filled: boolean): string {
  return `rounded-lg border ${filled ? "border-choy-green" : "border-lin-orange"} bg-bg-input px-3 py-2 text-[0.95rem] text-text-high`;
}

export const primaryBtnClass =
  "cursor-pointer rounded-lg border-0 bg-choy-green px-4 py-2 font-semibold text-bg-main disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryBtnClass =
  "cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2 text-text-medium disabled:cursor-not-allowed disabled:opacity-50";

export const dangerBtnClass =
  "cursor-pointer rounded-lg border border-[#e04b4b] bg-transparent px-4 py-2 text-[#e04b4b] disabled:cursor-not-allowed disabled:opacity-50";

export const actionsRowClass = "mt-4 flex shrink-0 justify-end gap-2";

export const placeholderClass =
  "flex flex-1 items-center justify-center p-6 text-center text-[0.9rem] text-text-low";
