import React, { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  LogOut,
  Moon,
  Sun,
  Target,
  UserRound
} from "lucide-react";
import { useAuth } from "./state/AuthContext.jsx";
import { useDashboard } from "./hooks/useDashboard.js";
import { syncLeetcodeProfile } from "./services/leetcodeService.js";
import { supabase } from "./lib/supabase.js";

import Splash from "./components/Splash.jsx";
import LandingPage from "./components/LandingPage.jsx";
import AuthModal from "./components/AuthModal.jsx";
import LeetcodeSync from "./components/LeetcodeSync.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Mistakes from "./views/Mistakes.jsx";
import Revisions from "./views/Revisions.jsx";
import Patterns from "./views/Patterns.jsx";
import Profile from "./views/Profile.jsx";

export default function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  if (loading) return <Splash />;
  if (!user) {
    return (
      <>
        <LandingPage onAuth={(mode) => setAuthMode(mode)} theme={theme} toggleTheme={toggleTheme} />
        {authMode && (
          <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode(null)} />
        )}
      </>
    );
  }

  return <Workspace />;
}

function Workspace() {
  const { user, logout, updateUser } = useAuth();
  const { dashboard, loading, error: dbError, refreshDashboard } = useDashboard();
  const [view, setView] = useState("dashboard");
  const [status, setStatus] = useState("");
  const [theme, setTheme] = useState(user?.theme || "light");
  const [manuallySolvedSlugs, setManuallySolvedSlugs] = useState(() => {
    try {
      const saved = localStorage.getItem("dsa_tracker_solved_slugs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSolvedSlug = (slug) => {
    setManuallySolvedSlugs((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      localStorage.setItem("dsa_tracker_solved_slugs", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user]);

  async function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ theme: nextTheme })
        .eq("id", user.id);
      if (error) throw error;
      updateUser({ ...user, theme: nextTheme });
    } catch (err) {
      setStatus(`Failed to update theme: ${err.message}`);
    }
  }

  async function syncLeetcode(username) {
    setStatus("Syncing live LeetCode profile...");
    try {
      const result = await syncLeetcodeProfile(username);
      await refreshDashboard();
      setStatus(`Synced ${result.snapshot.username}. Logged ${result.newLoggedCount} new mistakes.`);
    } catch (err) {
      setStatus(`Sync failed: ${err.message}`);
    }
  }

  async function refreshDashboardTrigger(message = "Updated.") {
    await refreshDashboard();
    setStatus(message);
  }

  const navItems = [
    ["dashboard", BarChart3, "Dashboard"],
    ["mistakes", ClipboardList, "Mistakes"],
    ["revisions", BookOpenCheck, "Revision"],
    ["patterns", Target, "Patterns"],
    ["profile", UserRound, "Profile"]
  ];
  
  function viewTitle(v) {
    const map = {
      dashboard: "Dashboard Overview",
      mistakes: "Mistakes & Workflows",
      revisions: "Spaced Repetition",
      patterns: "Pattern Mastery",
      profile: "Profile & History"
    };
    return map[v] || v;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">D</span>
          <div>
            <strong>DSA Tracker</strong>
            <span>Live revision system</span>
          </div>
        </div>
        <nav>
          {navItems.map(([id, Icon, label]) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button className="theme-button" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </button>
        <button className="logout-button" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Workflow</span>
            <h1>{viewTitle(view)}</h1>
          </div>
          <LeetcodeSync current={dashboard?.user?.leetcodeUsername} onSync={syncLeetcode} />
        </header>

        {status && <p className="toast">{status}</p>}
        {(!dashboard || loading) ? (
          <Splash />
        ) : (
          <>
            {view === "dashboard" && (
              <Dashboard
                dashboard={dashboard}
                onRefresh={() => refreshDashboardTrigger("Dashboard refreshed.")}
                manuallySolvedSlugs={manuallySolvedSlugs}
                toggleSolvedSlug={toggleSolvedSlug}
              />
            )}
            {view === "mistakes" && <Mistakes dashboard={dashboard} onChanged={refreshDashboardTrigger} />}
            {view === "revisions" && <Revisions dashboard={dashboard} onChanged={refreshDashboardTrigger} />}
            {view === "patterns" && <Patterns dashboard={dashboard} manuallySolvedSlugs={manuallySolvedSlugs} toggleSolvedSlug={toggleSolvedSlug} />}
            {view === "profile" && <Profile dashboard={dashboard} />}
          </>
        )}
      </main>
    </div>
  );
}
