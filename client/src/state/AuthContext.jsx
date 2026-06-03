import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const payload = await apiRequest("/api/auth/refresh", { method: "POST" }).catch(() => null);
    if (!payload?.accessToken) {
      setAccessToken("");
      setUser(null);
      return "";
    }
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    return payload.accessToken;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const authedApi = useCallback(
    (path, options = {}) => apiRequest(path, { ...options, token: accessToken, refresh }),
    [accessToken, refresh]
  );

  const login = useCallback(async (credentials) => {
    const payload = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    setAccessToken(payload.accessToken);
    setUser(payload.user);
  }, []);

  const register = useCallback(async (input) => {
    const payload = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    });
    setAccessToken(payload.accessToken);
    setUser(payload.user);
  }, []);

  const logout = useCallback(async () => {
    if (accessToken) {
      await apiRequest("/api/auth/logout", { method: "POST", token: accessToken }).catch(() => null);
    }
    setAccessToken("");
    setUser(null);
  }, [accessToken]);

  const updateUser = useCallback((nextUser) => setUser(nextUser), []);

  const value = useMemo(
    () => ({ user, accessToken, loading, login, register, logout, api: authedApi, updateUser }),
    [user, accessToken, loading, login, register, logout, authedApi, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
