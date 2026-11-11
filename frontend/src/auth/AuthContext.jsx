import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api.js";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("smartlearning-token");
    if (!token) { setReady(true); return; }
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("smartlearning-token"))
      .finally(() => setReady(true));
  }, []);

  async function signIn(credentials, register = false) {
    const { data } = await api.post(register ? "/auth/register" : "/auth/login", credentials);
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
