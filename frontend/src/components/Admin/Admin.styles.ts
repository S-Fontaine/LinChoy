export const pageWrapperClass =
  "flex justify-center px-8 py-8 max-sm:h-[calc(100dvh-5.5rem)] max-sm:items-center max-sm:px-4 max-sm:py-4";

export const shellClass =
  "relative flex w-full max-w-312.5 overflow-hidden rounded-2xl border border-border bg-[color-mix(in_srgb,var(--bg-main)_75%,transparent)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-sm:h-full max-sm:flex-col";

const mobileHiddenScrollbarClass =
  "max-sm:[scrollbar-width:none] max-sm:[-ms-overflow-style:none] max-sm:[&::-webkit-scrollbar]:hidden";

const sidebarSharedMobileClass =
  "max-sm:absolute max-sm:inset-0 max-sm:z-20 max-sm:w-full max-sm:overflow-y-auto max-sm:border-r-0 max-sm:bg-bg-main max-sm:transition-transform max-sm:duration-300 max-sm:ease-smooth";

export const sidebarClass = `flex w-72 shrink-0 flex-col border-r border-border px-3 py-8 ${sidebarSharedMobileClass} ${mobileHiddenScrollbarClass} max-sm:translate-y-full`;

export const sidebarOpenClass = `flex w-72 shrink-0 flex-col border-r border-border px-3 py-8 ${sidebarSharedMobileClass} ${mobileHiddenScrollbarClass} max-sm:translate-y-0`;

export const sidebarHeaderClass = "mb-4 flex items-center justify-between px-1";

export const mobileToolbarClass =
  "hidden items-center justify-end gap-2 border-t border-border bg-bg-main px-4 py-3 max-sm:relative max-sm:z-30 max-sm:flex";

export const mobileToolbarBtnClass =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-text-high";

export const mobileContentWrapClass = "flex min-w-0 flex-1 flex-col overflow-hidden";

export const pageTitleClass = "text-[1.1rem] text-text-high";

export const adminBadgeClass =
  "rounded-full border border-lin-orange bg-[color-mix(in_srgb,var(--lin-orange)_10%,transparent)] px-2.5 py-1 text-[0.7rem] font-bold tracking-wider text-lin-orange uppercase";

export const newRowClass =
  "mb-2 flex w-full cursor-pointer items-center gap-2 rounded-lg border-l-4 px-3 py-2.5 text-left text-[0.9rem] font-semibold transition-all duration-300 ease-smooth";

export const listRowBaseClass =
  "mb-2 flex w-full flex-col gap-2.5 rounded-xl border px-3 py-2.5 text-[0.9rem] transition-all duration-300 ease-smooth";

export const rowActionsClass = "mt-1 flex items-center gap-1.5";

export const rowActionBtnClass =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-bg-input text-text-low transition-colors duration-300 ease-smooth hover:bg-[color-mix(in_srgb,var(--text-high)_6%,transparent)] disabled:cursor-not-allowed disabled:opacity-40";

export const listRowActiveClass =
  "border-lin-orange bg-[color-mix(in_srgb,var(--lin-orange)_10%,transparent)] text-text-high";

export const listRowInactiveClass =
  "border-border text-text-low hover:bg-[color-mix(in_srgb,var(--text-high)_6%,transparent)]";

export const rowStatusRowClass =
  "flex shrink-0 items-center gap-1.5 text-[0.75rem]";

type ServerState = "offline" | "starting" | "online";

export const rowStatusDotClass: Record<ServerState, string> = {
  online: "bg-choy-green shadow-[0_0_8px_var(--choy-green)]",
  starting:
    "bg-lin-orange shadow-[0_0_8px_var(--lin-orange)] animate-[pulse_1.5s_ease-in-out_infinite]",
  offline: "bg-border",
};

export const rowStatusLabelClass: Record<ServerState, string> = {
  online: "text-choy-green",
  starting: "text-lin-orange",
  offline: "text-text-low",
};

export const rowStatusLabelText: Record<ServerState, string> = {
  online: "En ligne",
  starting: "Démarrage...",
  offline: "Hors ligne",
};

export const newRowInactiveClass =
  "border-l-transparent text-lin-orange hover:bg-[color-mix(in_srgb,var(--lin-orange)_8%,transparent)]";

export const detailPanelClass = `flex min-w-0 flex-1 flex-col p-8 max-sm:overflow-y-auto max-sm:p-4 ${mobileHiddenScrollbarClass}`;

export const detailHeaderClass =
  "mb-4 flex items-center justify-between gap-3 max-sm:flex-wrap";

export const detailTitleRowClass = "flex min-w-0 items-center gap-2.5";

export const detailTitleClass = "truncate text-[1.2rem] text-text-high";

export const typeBadgeClass =
  "shrink-0 rounded-[20px] border border-border bg-[color-mix(in_srgb,var(--text-high)_5%,transparent)] px-2.5 py-1 text-[0.75rem] font-semibold text-text-low";

export const sectionHeaderClass =
  "mt-1 border-b border-border pb-1.5 text-[0.75rem] font-bold tracking-wider text-lin-orange uppercase";

export const fieldGridClass = "grid grid-cols-2 gap-3 max-sm:grid-cols-1";

export const sectionColumnsClass = "grid grid-cols-3 gap-6 max-sm:grid-cols-1";

export const sectionColumnClass = "flex flex-col gap-3";

export const fieldLabelClass = "flex flex-col gap-1 text-[0.8rem] text-text-low";

export const fieldRowClass =
  "flex items-center gap-2 text-[0.8rem] text-text-low max-sm:flex-col max-sm:items-start max-sm:gap-1";

export const fieldRowLabelClass = "w-28 shrink-0 max-sm:w-auto";

export const fieldRowInputClass = "min-w-0 flex-1 max-sm:w-full";

export const inputClass =
  "rounded-lg border border-border bg-bg-input px-3 py-2 text-[0.95rem] text-text-high max-sm:w-full";

export function requiredInputClass(filled: boolean): string {
  return `rounded-lg border ${filled ? "border-choy-green" : "border-lin-orange"} bg-bg-input px-3 py-2 text-[0.95rem] text-text-high max-sm:w-full`;
}

export const readOnlyFieldClass =
  "border-0 bg-transparent px-0 py-1 text-[0.95rem] text-text-high disabled:cursor-default disabled:opacity-100 max-sm:w-full";

export const primaryBtnClass =
  "cursor-pointer rounded-lg border-0 bg-choy-green px-4 py-2 font-semibold text-bg-main transition-colors duration-300 ease-smooth hover:bg-[color-mix(in_srgb,var(--choy-green)_85%,black)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-choy-green";

export const secondaryBtnClass =
  "cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2 text-text-medium transition-colors duration-300 ease-smooth hover:bg-[color-mix(in_srgb,var(--text-high)_6%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent";

export const dangerBtnClass =
  "cursor-pointer rounded-lg border border-danger bg-transparent px-4 py-2 text-danger transition-colors duration-300 ease-smooth hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent";

export const actionsRowClass = "mt-4 flex shrink-0 justify-end gap-2 max-sm:flex-wrap";

export const detailActionsRowClass =
  "mt-4 flex shrink-0 items-center justify-between gap-2 max-sm:flex-wrap";

export const placeholderClass =
  "flex flex-1 items-center justify-center p-6 text-center text-[0.9rem] text-text-low";
