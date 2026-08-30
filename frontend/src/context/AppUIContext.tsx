"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

type View = "ServerStatus" | "AccountSettings";

interface AppUIContextValue {
  isOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  activeView: View;
  openServerStatus: () => void;
  openAccountSettings: () => void;
}

const AppUIContext = createContext<AppUIContextValue | undefined>(undefined);

export function AppUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>("ServerStatus");

  function goHomeAnd(view: View) {
    setActiveView(view);
    if (pathname !== "/") router.push("/");
  }

  return (
    <AppUIContext.Provider
      value={{
        isOpen,
        openAuth: () => setIsOpen(true),
        closeAuth: () => setIsOpen(false),
        activeView,
        openServerStatus: () => goHomeAnd("ServerStatus"),
        openAccountSettings: () => goHomeAnd("AccountSettings"),
      }}
    >
      {children}
    </AppUIContext.Provider>
  );
}

export function useAppUI() {
  const ctx = useContext(AppUIContext);
  if (!ctx) throw new Error("useAppUI doit être utilisé dans AppUIProvider");
  return ctx;
}