import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getSession, setSession, clearSession, authenticate, initStorage } from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initStorage();
    seedDemoData();
    const session = getSession();
    if (session) setUser(session);
  }, []);

  function login(username: string, password: string): boolean {
    const found = authenticate(username, password);
    if (found) {
      setUser(found);
      setSession(found);
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
    clearSession();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isManager: user?.role === "manager",
        isEmployee: user?.role === "employee",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
