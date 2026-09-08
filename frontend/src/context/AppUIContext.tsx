"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

  const goHomeAnd = useCallback(
    (view: View) => {
      setActiveView(view);
      if (pathname !== "/") router.push("/");
    },
    [pathname, router],
  );

  const openAuth = useCallback(() => setIsOpen(true), []);
  const closeAuth = useCallback(() => setIsOpen(false), []);
  const openServerStatus = useCallback(
    () => goHomeAnd("ServerStatus"),
    [goHomeAnd],
  );
  const openAccountSettings = useCallback(
    () => goHomeAnd("AccountSettings"),
    [goHomeAnd],
  );

  const value = useMemo(
    () => ({
      isOpen,
      openAuth,
      closeAuth,
      activeView,
      openServerStatus,
      openAccountSettings,
    }),
    [isOpen, openAuth, closeAuth, activeView, openServerStatus, openAccountSettings],
  );

  return (
    <AppUIContext.Provider value={value}>{children}</AppUIContext.Provider>
  );
}

export function useAppUI() {
  const ctx = useContext(AppUIContext);
  if (!ctx) throw new Error("useAppUI doit être utilisé dans AppUIProvider");
  return ctx;
}