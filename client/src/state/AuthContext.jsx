import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose accessor for JWT token if needed elsewhere
  const accessToken = session?.access_token || "";

  // Fetches public.profiles data for the current authenticated user
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Trigger might still be running or user doesn't have a profile yet
        console.warn("Could not fetch user profile from profiles table:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Profile fetch exception:", err);
      return null;
    }
  }, []);

  // Consolidates auth user metadata and profiles database row
  const syncUserAndProfile = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }

    const profile = await fetchProfile(sessionUser.id);
    setUser({
      id: sessionUser.id,
      email: sessionUser.email,
      name: profile?.name || sessionUser.user_metadata?.name || "User",
      leetcodeUsername: profile?.leetcode_username || sessionUser.user_metadata?.leetcodeUsername || "",
      theme: profile?.theme || "light"
    });
  }, [fetchProfile]);

  // Initializes session and sets up auth state listener
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data: { session: activeSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          setSession(activeSession);
          if (activeSession?.user) {
            await syncUserAndProfile(activeSession.user);
          }
        }
      } catch (err) {
        console.error("Error initializing Supabase session:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    // Listen for auth changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        if (currentSession?.user) {
          await syncUserAndProfile(currentSession.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [syncUserAndProfile]);

  // Login handler
  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data?.user) {
      await syncUserAndProfile(data.user);
    }
  }, [syncUserAndProfile]);

  // Register handler
  const register = useCallback(async ({ name, email, password, leetcodeUsername }) => {
    // Basic password validation matching the backend's strict regex rules
    if (!/[A-Z]/.test(password)) throw new Error("Password must include an uppercase letter.");
    if (!/[a-z]/.test(password)) throw new Error("Password must include a lowercase letter.");
    if (!/[0-9]/.test(password)) throw new Error("Password must include a number.");
    if (/[A-Za-z0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password)) {
      throw new Error("Password must include a symbol.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          leetcodeUsername: leetcodeUsername.trim()
        }
      }
    });

    if (error) throw error;

    // Check if user is automatically logged in or email confirmation is required
    if (data?.user) {
      await syncUserAndProfile(data.user);
    }
  }, [syncUserAndProfile]);

  // Logout handler
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  }, []);

  // Update local profile handler (saves to DB profiles table)
  const updateUser = useCallback((nextUser) => {
    setUser((prev) => (prev ? { ...prev, ...nextUser } : null));
  }, []);

  // Backward compatible api fetch wrapper for LeetCode proxy sync requests
  const api = useCallback(async (path, options = {}) => {
    if (path.includes("/leetcode/sync")) {
      const response = await fetch("/api/leetcode/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: options.body
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "LeetCode synchronization failed.");
      }
      return response.json();
    }
    throw new Error(`API path ${path} is not supported under the serverless Supabase configuration.`);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      accessToken,
      loading,
      login,
      register,
      logout,
      updateUser,
      api
    }),
    [user, session, accessToken, loading, login, register, logout, updateUser, api]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
