import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "../api";
import type { AuthenticatedUser } from "../types";

interface SignInCredentials {
  name?: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthenticatedUser | null;
  ready: boolean;
  signIn: (credentials: SignInCredentials, register?: boolean) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("smartlearning-token");
    if (!token) { setReady(true); return; }
    api.get<{ user: AuthenticatedUser }>("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("smartlearning-token"))
      .finally(() => setReady(true));
  }, []);

  async function signIn(credentials: SignInCredentials, register = false) {
    const { data } = await api.post<{ token: string; user: AuthenticatedUser }>(
      register ? "/auth/register" : "/auth/login",
      credentials,
    );
    localStorage.setItem("smartlearning-token", data.token);
    setUser(data.user);
  }
  function signOut() {
    localStorage.removeItem("smartlearning-token");
    setUser(null);
  }
  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider.");
  return value;
}

export function useCurrentUser(): AuthenticatedUser {
  const { user } = useAuth();
  if (!user) throw new Error("An authenticated user is required.");
  return user;
}
