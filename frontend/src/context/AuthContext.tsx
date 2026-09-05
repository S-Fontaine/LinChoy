"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface User {
  id: string;
  username: string;
  email: string;
  favoriteServer: string | null;
  steamId: string | null;
  minecraftUuid: string | null;
  minecraftUsername: string | null;
  minecraftVerified: boolean;
  minecraftLinkExpiresAt: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  updateUser: (updater: (prev: User) => User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetchWithAuth("/auth/me", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  function updateUser(updater: (prev: User) => User) {
    setUser((prev) => (prev ? updater(prev) : prev));
  }

  async function logout() {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, setUser, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
}
