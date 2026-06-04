import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Brain,
  ChevronRight,
  ClipboardList,
  LogOut,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  UserRound,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Search
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useAuth } from "./state/AuthContext.jsx";

const topics = [
  "Array",
  "String",
  "Hash Table",
  "Two Pointers",
  "Binary Search",
  "Sliding Window",
  "Stack",
  "Linked List",
  "Tree",
  "Graph",
  "Dynamic Programming",
  "Backtracking",
  "Greedy",
  "Trie",
  "Union Find",
  "Intervals"
];

const patterns = [
  "Hashing",
  "Two pointers",
  "Sliding window",
  "Modified binary search",
  "Monotonic stack",
  "DFS/BFS",
  "Topological sort",
  "1D DP",
  "Knapsack",
  "Backtracking",
  "Greedy reachability",
  "Union Find"
];

export default function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null
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

function Splash() {
  return (
    <main className="center-screen">
      <div className="loader" />
      <p>Securing your workspace...</p>
    </main>
  );
}

function LandingPage({ onAuth, theme, toggleTheme }) {
  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <div className="landing-logo">DSA Tracker</div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </nav>
        <div className="landing-auth-buttons">
          <button className="landing-btn-text" onClick={toggleTheme} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="landing-btn-text" onClick={() => onAuth("login")}>Login</button>
          <button className="landing-btn-solid" onClick={() => onAuth("register")}>Sign Up</button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-left">
          <span className="landing-hero-badge">Efficiency First</span>
          <h1>
            Progressive learning comes from <span className="highlight">revising mistakes.</span>
          </h1>
          <p>
            The ultimate platform for tracking your coding errors, mastering algorithms, and ensuring you never make the same mistake twice.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn-primary" onClick={() => onAuth("register")}>Get Started</button>
            <button className="landing-btn-secondary" onClick={() => alert("Watch Demo: Visual tracking and error analysis tool details coming soon!")}>Watch Demo</button>
          </div>
        </div>

        <div className="landing-hero-media">
          <div className="landing-ide-mock">
            <div className="landing-ide-header">
              <div className="landing-ide-dot red"></div>
              <div className="landing-ide-dot yellow"></div>
              <div className="landing-ide-dot green"></div>
            </div>
            <pre className="landing-ide-code">
{`function solve() {
  // Analyzing mistake trends
  let patterns = ["DFS", "Two Pointers"];
  let mistakes = getLoggedMistakes();
  
  if (mistakes.length > 0) {
    return runRevisionSession();
  }
}`}
            </pre>
          </div>
          <div className="landing-mistake-card">
            <div className="landing-mistake-icon">
              <AlertTriangle size={18} />
            </div>
            <div className="landing-mistake-text">
              <small>Recent Mistake</small>
              <strong>Edge case: Empty Array</strong>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features-section">
        <div className="landing-features-container">
          <h2 className="landing-features-title">Built for Technical Rigor</h2>
          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrapper">
                <Search size={22} />
              </div>
              <h3>Error Analysis</h3>
              <p>
                Deep dive into why your logic failed. Catalog your thought process, identify common pitfalls, and document the corrected solution for future reference.
              </p>
              <span className="landing-feature-tag">O(1) Access</span>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrapper">
                <RefreshCw size={22} />
              </div>
              <h3>Revision Reminders</h3>
              <p>
                Spaced repetition for your solved problems. Our algorithm ensures you revisit difficult concepts at the optimal time to maximize long-term retention.
              </p>
              <span className="landing-feature-tag">Memory++</span>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrapper">
                <BarChart3 size={22} />
              </div>
              <h3>Performance Tracking</h3>
              <p>
                Visualize your growth over time. Track your average time-to-solve, mistake frequency by category, and watch your consistency score climb.
              </p>
              <span className="landing-feature-tag">Metrics-Driven</span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="landing-split-section">
        <div className="landing-split-left">
          <h2>Stop guessing, start measuring.</h2>
          <div className="landing-split-list">
            <div className="landing-split-item">
              <div className="landing-split-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="landing-split-text">
                <h3>Integrated IDE Snippets</h3>
                <p>Import your code directly from LeetCode or VS Code with syntax preservation.</p>
              </div>
            </div>

            <div className="landing-split-item">
              <div className="landing-split-icon">
                <Activity size={20} />
              </div>
              <div className="landing-split-text">
                <h3>Complexity Comparison</h3>
                <p>Compare your solution's O(n) complexity against optimal industry standards.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-split-right">
          <pre className="landing-ide-code">
{`function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);`}
          </pre>
          <div className="landing-code-highlighted">
            <pre className="landing-ide-code" style={{ margin: 0 }}>
{`    // Mistake: Incorrect index update
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid; // Should be mid + 1
    else right = mid; // Should be mid - 1`}
            </pre>
          </div>
          <pre className="landing-ide-code">
{`  }
  return -1;
}`}
          </pre>
          <div className="landing-code-meta">
            <span>Error Log: Off-By-One</span>
            <span className="landing-code-meta-right">Revision Req: 2 Days</span>
          </div>
        </div>
      </section>

      <section className="landing-cta-section">
        <h2>Ready to master DSA?</h2>
        <p>
          Join thousands of software engineers who use DSA Tracker to land jobs at top tech companies.
        </p>
        <button onClick={() => onAuth("register")}>Get Started Now</button>
      </section>

      <footer className="landing-footer-section">
        <div className="landing-footer-container">
          <div className="landing-footer-left">
            <h4>DSA Tracker</h4>
            <span>&copy; 2024 DSA Tracker. All rights reserved.</span>
          </div>
          <div className="landing-footer-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Privacy Policy coming soon!"); }}>Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Terms of Service coming soon!"); }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuthModal({ mode, setMode, onClose }) {
  const { login, register } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    try {
      if (mode === "register") await register(payload);
      else await login(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>
        <form className="auth-card" onSubmit={submit} style={{ border: "none", boxShadow: "none", padding: 0, margin: 0 }}>
          <div className="segmented">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
              Sign up
            </button>
          </div>

          {mode === "register" && <input name="name" placeholder="Full name" minLength={2} required />}
          <input name="email" type="email" placeholder="Email" required />
          <input
            name="password"
            type="password"
            placeholder={mode === "register" ? "Strong password" : "Password"}
            minLength={mode === "register" ? 10 : 1}
            required
          />
          {mode === "register" && (
            <small>Password needs 10+ chars with uppercase, lowercase, number, and symbol.</small>
          )}
          {error && <p className="error">{error}</p>}
          <button className="primary-action" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Working..." : mode === "register" ? "Create secure account" : "Enter dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Workspace() {
  const { user, logout, api, updateUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [view, setView] = useState("dashboard");
  const [status, setStatus] = useState("");
  const [theme, setTheme] = useState(user.theme || "light");

  const loadDashboard = async () => {
    const payload = await api("/api/profile/dashboard");
    setDashboard(payload);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    loadDashboard().catch((err) => setStatus(err.message));
  }, []);

  async function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    const payload = await api("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ theme: nextTheme })
    });
    updateUser(payload.user);
  }

  async function syncLeetcode(username) {
    setStatus("Syncing live LeetCode profile...");
    const payload = await api("/api/profile/leetcode/sync", {
      method: "POST",
      body: JSON.stringify({ username })
    });
    setDashboard(payload.dashboard);
    setStatus(`Synced ${payload.snapshot.username}.`);
  }

  async function refreshDashboard(message = "Updated.") {
    await loadDashboard();
    setStatus(message);
  }

  async function runAnalysis() {
    setStatus("Generating analysis from LeetCode and app signals...");
    const payload = await api("/api/profile/analysis", { method: "POST" });
    setDashboard(payload.dashboard);
    setStatus(`Analysis generated with ${payload.analysis.mode === "ai" ? "AI" : "rule engine"} mode.`);
  }

  const navItems = [
    ["dashboard", BarChart3, "Dashboard"],
    ["analysis", Sparkles, "Analysis"],
    ["mistakes", ClipboardList, "Mistakes"],
    ["revisions", BookOpenCheck, "Revision"],
    ["patterns", Target, "Patterns"],
    ["profile", UserRound, "Profile"]
  ];

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
        {!dashboard ? (
          <Splash />
        ) : (
          <>
            {view === "dashboard" && (
              <Dashboard
                dashboard={dashboard}
                onAnalyze={runAnalysis}
                onRefresh={() => refreshDashboard("Dashboard refreshed.")}
              />
            )}
            {view === "analysis" && <Analysis dashboard={dashboard} onAnalyze={runAnalysis} />}
            {view === "mistakes" && <Mistakes dashboard={dashboard} api={api} onChanged={refreshDashboard} />}
            {view === "revisions" && <Revisions dashboard={dashboard} api={api} onChanged={refreshDashboard} />}
            {view === "patterns" && <Patterns dashboard={dashboard} api={api} onChanged={refreshDashboard} />}
            {view === "profile" && <Profile dashboard={dashboard} />}
          </>
        )}
      </main>
    </div>
  );
}

function LeetcodeSync({ current, onSync }) {
  const [username, setUsername] = useState(current || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setUsername(current || ""), [current]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSync(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="sync-card" onSubmit={submit}>
      <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="LeetCode username" required />
      <button disabled={busy}>
        <RefreshCw size={16} /> {busy ? "Syncing" : "Sync"}
      </button>
      {error && <small className="error">{error}</small>}
    </form>
  );
}

function Dashboard({ dashboard, onRefresh, onAnalyze }) {
  const { metrics, attemptStats, topicInsights, uncoveredTopics, recommendations, learningCurve } = dashboard;
  const accuracy = metrics.submissions.all ? Math.round((metrics.solved.all / metrics.submissions.all) * 100) : 0;
  const strongest = [...topicInsights].sort((a, b) => b.strength - a.strength).slice(0, 5);
  const weakest = topicInsights.slice(0, 5);

  return (
    <section className="stack">
      <div className="metric-grid">
        <Metric label="Solved" value={metrics.solved.all} detail={`E ${metrics.solved.easy} - M ${metrics.solved.medium} - H ${metrics.solved.hard}`} />
        <Metric label="Accuracy" value={`${accuracy}%`} detail="Accepted vs submissions" />
        <Metric label="Active days" value={metrics.activeDays} detail={`Current streak ${metrics.streak}`} />
        <Metric label="Due revisions" value={metrics.dueRevisions} detail={`${metrics.openMistakes} open mistakes`} />
        <Metric label="Recent attempts" value={attemptStats.totalRecent || 0} detail={`${attemptStats.failedRecent || 0} failed - ${attemptStats.recentAcceptanceRate || 0}% accepted`} />
      </div>

      <div className="grid two">
        <Panel title="Learning Curve" action={<button onClick={onRefresh}>Refresh</button>}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={learningCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area dataKey="solved" stroke="var(--brand)" fill="rgba(220, 38, 38, 0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Dynamic Report" icon={<Brain size={18} />} action={<button onClick={onAnalyze}>Generate analysis</button>}>
          <div className="report">
            <p>{recommendations.report.summary}</p>
            <p>{recommendations.report.diagnosis}</p>
            <p>{recommendations.report.nextAction}</p>
          </div>
        </Panel>
      </div>

      <div className="grid three">
        <Panel title="Strong Areas">
          <TopicBars items={strongest} />
        </Panel>
        <Panel title="Weak Areas">
          <TopicBars items={weakest} weak />
        </Panel>
        <Panel title="Yet To Cover">
          <div className="pill-list">
            {uncoveredTopics.slice(0, 12).map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </Panel>
      </div>

      <Recommendations recommendations={recommendations} />
    </section>
  );
}

function Analysis({ dashboard, onAnalyze }) {
  const analysis = dashboard.latestAnalysis;
  const report = analysis?.report;
  const attemptStats = dashboard.attemptStats || {};

  if (!report) {
    return (
      <Panel title="AI / Rule Analysis" icon={<Sparkles size={18} />} action={<button onClick={onAnalyze}>Generate analysis</button>}>
        <Empty text="No analysis report yet. Generate one after syncing LeetCode and logging mistakes." />
      </Panel>
    );
  }

  return (
    <section className="stack">
      <div className="metric-grid">
        <Metric label="Mode" value={analysis.mode.toUpperCase()} detail={analysis.model || analysis.provider} />
        <Metric label="Risk" value={report.riskLevel} detail="Current learning risk" />
        <Metric label="Confidence" value={`${Math.round(report.confidenceScore)}%`} detail="Plan confidence" />
        <Metric label="Recent failed" value={attemptStats.failedRecent || 0} detail="LeetCode public submissions" />
        <Metric label="Themes" value={report.mistakeThemes?.length || 0} detail="Mistake clusters found" />
      </div>

      <Panel title="Analysis Summary" icon={<Sparkles size={18} />} action={<button onClick={onAnalyze}>Regenerate</button>}>
        <div className="report">
          <p>{report.summary}</p>
        </div>
      </Panel>

      <div className="grid three">
        <Panel title="Weak Signals">
          <div className="card-list">
            {report.weakSignals.map((item) => (
              <article className="item-card" key={item.area}>
                <header>
                  <strong>{item.area}</strong>
                  <Badge tone="warn">focus</Badge>
                </header>
                <p>{item.evidence}</p>
                <span>{item.nextAction}</span>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Mistake Themes">
          <div className="card-list">
            {report.mistakeThemes.map((item) => (
              <article className="item-card" key={item.theme}>
                <header>
                  <strong>{item.theme}</strong>
                  <Badge tone="danger">{item.count}</Badge>
                </header>
                <p>{item.correction}</p>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Revision Strategy">
          <div className="card-list">
            {report.revisionStrategy.map((item) => (
              <article className="item-card" key={item.title}>
                <header>
                  <strong>{item.title}</strong>
                  <Badge tone="info">{item.cadence}</Badge>
                </header>
                <p>{item.drill}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="AI Practice Focus">
        <div className="question-grid">
          {report.practiceFocus.map((item) => (
            <article className="question-card" key={`${item.title}-${item.topic}`}>
              <header>
                <strong>{item.title}</strong>
                <Badge tone={item.difficulty === "Hard" ? "danger" : item.difficulty === "Medium" ? "warn" : "good"}>
                  {item.difficulty}
                </Badge>
              </header>
              <span>{item.topic}</span>
              <p>{item.reason}</p>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Mistakes({ dashboard, api, onChanged }) {
  const [error, setError] = useState("");

  async function addMistake(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    try {
      await api("/api/mistakes", { method: "POST", body: JSON.stringify(payload) });
      event.currentTarget.reset();
      await onChanged("Mistake recorded and revision pressure recalculated.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function review(id, resolved, rating = "hint") {
    await api(`/api/mistakes/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ resolved, rating })
    });
    await onChanged(resolved ? "Mistake resolved." : `Mistake reviewed: ${rating}`);
  }

  return (
    <section className="grid two">
      <Panel title="Record Mistake">
        <form className="form-grid" onSubmit={addMistake}>
          <input name="problemTitle" placeholder="Problem title" required />
          <input name="problemSlug" placeholder="leetcode-slug (optional)" />
          <Select name="topic" options={topics} placeholder="Topic" />
          <Select name="pattern" options={patterns} placeholder="Pattern" />
          <select name="mistakeType" required>
            <option value="">Mistake type</option>
            <option value="concept">Concept</option>
            <option value="edge-case">Edge case</option>
            <option value="implementation">Implementation</option>
            <option value="complexity">Complexity</option>
            <option value="pattern-choice">Pattern choice</option>
            <option value="dry-run">Dry run</option>
          </select>
          <select name="severity" defaultValue="3">
            <option value="1">Severity 1</option>
            <option value="2">Severity 2</option>
            <option value="3">Severity 3</option>
            <option value="4">Severity 4</option>
            <option value="5">Severity 5</option>
          </select>
          <textarea name="rootCause" placeholder="Root cause" required />
          <textarea name="correction" placeholder="Correction or invariant" />
          {error && <p className="error">{error}</p>}
          <button className="primary-action">Save mistake</button>
        </form>
      </Panel>

      <Panel title="Mistake Workflow">
        <div className="card-list">
          {dashboard.mistakes.map((mistake) => (
            <article className="item-card" key={mistake._id}>
              <header>
                <div>
                  <strong>{mistake.problemTitle}</strong>
                  <span>{mistake.topic} - {mistake.pattern} - severity {mistake.severity}</span>
                </div>
                <Badge tone={mistake.status === "resolved" ? "good" : "warn"}>{mistake.status}</Badge>
              </header>
              <p>{mistake.rootCause}</p>
              <div className="actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button style={{ background: "var(--danger)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, false, "failed")}>Failed</button>
                <button style={{ background: "var(--warn)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, false, "hint")}>Hint Used</button>
                <button style={{ background: "var(--good)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, false, "easy")}>Easy Solve</button>
                <button style={{ background: "var(--brand)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, true, "easy")}>Resolve</button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Revisions({ dashboard, api, onChanged }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState("");
  const [selectedDaySessions, setSelectedDaySessions] = useState(null);

  async function scheduleCustom(event) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    try {
      await api("/api/revisions", { method: "POST", body: JSON.stringify(payload) });
      event.currentTarget.reset();
      await onChanged("Custom spaced repetition schedule created.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function complete(id) {
    await api(`/api/revisions/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ reflection: "Completed from calendar." })
    });
    await onChanged("Revision session completed.");
  }

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysGrid = [];
  // Padding cells
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push({ day: null, isPadding: true });
  }
  // Days of month cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(year, month, d);
    const daySessions = (dashboard.revisions || []).filter((session) => {
      const sDate = new Date(session.scheduledFor);
      return sDate.getDate() === d && sDate.getMonth() === month && sDate.getFullYear() === year;
    });
    daysGrid.push({ day: d, date: dDate, sessions: daySessions });
  }

  return (
    <section className="grid two">
      <Panel title="Schedule Spaced Repetitions">
        <form className="form-grid" onSubmit={scheduleCustom} style={{ display: "grid", gap: "14px" }}>
          <div style={{ gridColumn: "1 / -1", display: "grid", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Select Topic</label>
              <Select name="topic" options={topics} placeholder="Topic" />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Pattern Name (optional)</label>
              <input name="pattern" placeholder="e.g. Two Pointers" />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Solved Count</label>
              <input name="solvedCount" type="number" min="0" placeholder="e.g. 10" defaultValue="0" />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Spaced Repetition Days Schedule</label>
              <input name="scheduleDays" placeholder="e.g. 2,4,5,6,7" defaultValue="2,4,5,6,7" required />
              <small style={{ color: "var(--muted)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Comma-separated day offsets from today for scheduled revision tasks.
              </small>
            </div>
          </div>
          {error && <p className="error" style={{ gridColumn: "1 / -1" }}>{error}</p>}
          <button className="primary-action" style={{ gridColumn: "1 / -1" }}>Create Schedule</button>
        </form>

        {selectedDaySessions && (
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--line)" }}>
            <h3>Revisions for {selectedDaySessions.date.toLocaleDateString()}</h3>
            {selectedDaySessions.sessions.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No tasks scheduled.</p>
            ) : (
              <div className="card-list" style={{ marginTop: "12px" }}>
                {selectedDaySessions.sessions.map((session) => (
                  <article className="item-card" key={session._id}>
                    <header>
                      <div>
                        <strong>{session.title}</strong>
                        <span style={{ fontSize: "11px", display: "block", color: "var(--muted)" }}>
                          {session.pattern ? `${session.focusTopic} - ${session.pattern}` : session.focusTopic}
                        </span>
                      </div>
                      <Badge tone={session.status === "completed" ? "good" : "info"}>{session.status}</Badge>
                    </header>
                    <p style={{ fontSize: "13px", margin: "8px 0" }}>{session.plan}</p>
                    {session.status === "scheduled" && (
                      <button style={{ background: "var(--brand)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", marginTop: "8px", alignSelf: "flex-start", cursor: "pointer" }} onClick={() => {
                        complete(session._id);
                        setSelectedDaySessions(null);
                      }}>
                        Mark complete
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Revision Calendar" action={
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button style={{ border: "1px solid var(--line)", background: "var(--surface)", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }} onClick={prevMonth}>&lt;</button>
          <strong style={{ fontSize: "14px", minWidth: "120px", textAlign: "center" }}>{monthNames[month]} {year}</strong>
          <button style={{ border: "1px solid var(--line)", background: "var(--surface)", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }} onClick={nextMonth}>&gt;</button>
        </div>
      }>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center", fontWeight: "700", fontSize: "12px", marginBottom: "8px" }}>
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", gridAutoRows: "minmax(60px, auto)" }}>
          {daysGrid.map((cell, idx) => {
            if (cell.isPadding) {
              return <div key={`pad-${idx}`} style={{ background: "var(--surface-2)", opacity: 0.3, borderRadius: "4px" }} />;
            }
            const hasSessions = cell.sessions.length > 0;
            return (
              <div
                key={`day-${cell.day}`}
                onClick={() => setSelectedDaySessions(cell)}
                style={{
                  background: hasSessions ? "rgba(239, 68, 68, 0.05)" : "var(--surface-2)",
                  border: hasSessions ? "1px solid var(--brand)" : "1px solid transparent",
                  borderRadius: "4px",
                  padding: "4px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = hasSessions ? "rgba(239, 68, 68, 0.05)" : "var(--surface-2)"; }}
              >
                <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--ink)" }}>{cell.day}</span>
                {hasSessions && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", marginTop: "4px" }}>
                    {cell.sessions.map((s) => (
                      <span
                        key={s._id}
                        title={s.title}
                        style={{
                          fontSize: "8px",
                          background: s.status === "completed" ? "var(--good)" : "var(--brand)",
                          color: "#fff",
                          padding: "2px 4px",
                          borderRadius: "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "100%",
                          textAlign: "center"
                        }}
                      >
                        {s.pattern || s.focusTopic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </section>
  );
}

function Patterns({ dashboard }) {
  const insights = dashboard.topicInsights || [];

  return (
    <section className="grid two">
      <Panel title="LeetCode Pattern Strength">
        {insights.length === 0 ? (
          <Empty text="Sync your LeetCode profile to visualize pattern mastery." />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={insights}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="strength" fill="var(--brand)" name="Mastery %" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Panel title="LeetCode Topic Insights">
        {insights.length === 0 ? (
          <Empty text="Sync your LeetCode profile to view topic analytics." />
        ) : (
          <div className="card-list compact" style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
            {insights.map((item) => (
              <article className="item-card" key={item.topic}>
                <header>
                  <strong>{item.topic}</strong>
                  <Badge tone={item.strength >= 70 ? "good" : item.strength >= 40 ? "warn" : "danger"}>
                    {item.strength}% Strength
                  </Badge>
                </header>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                  <span>Total Solved: {item.solved}</span>
                  <span>E: {item.easy} | M: {item.medium} | H: {item.hard}</span>
                </div>
                <div className="bar-track" style={{ marginTop: "8px" }}>
                  <div className="bar-fill" style={{ width: `${item.strength}%`, background: "var(--brand)" }} />
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </section>
  );
}

function Recommendations({ recommendations }) {
  return (
    <Panel title="Adaptive Practice Queue" icon={<Activity size={18} />}>
      <div className="question-grid">
        {recommendations.questions.map((question) => (
          <a
            className="question-card"
            key={question.slug}
            href={`https://leetcode.com/problems/${question.slug}/`}
            target="_blank"
            rel="noreferrer"
          >
            <header>
              <strong>{question.title}</strong>
              <Badge tone={question.difficulty === "Hard" ? "danger" : question.difficulty === "Medium" ? "warn" : "good"}>
                {question.difficulty}
              </Badge>
            </header>
            <span>{question.topic} - {question.pattern}</span>
            <p>{question.reason}</p>
            <ChevronRight size={18} />
          </a>
        ))}
      </div>
    </Panel>
  );
}

function Profile({ dashboard }) {
  const profile = dashboard.leetcode?.profile || {};
  const latest = dashboard.leetcode;

  return (
    <section className="grid two">
      <Panel title="LeetCode Profile">
        {!latest ? (
          <Empty text="Sync a LeetCode username to populate profile details." />
        ) : (
          <div className="profile-card">
            {profile.userAvatar && <img src={profile.userAvatar} alt="" />}
            <div>
              <h2>{profile.realName || latest.username}</h2>
              <p>Rank {profile.ranking?.toLocaleString() || "unknown"} - Reputation {profile.reputation || 0}</p>
              <p>{profile.countryName || ""} {profile.company ? `- ${profile.company}` : ""}</p>
            </div>
          </div>
        )}
      </Panel>
      <Panel title="Your Work In App">
        <div className="metric-grid mini">
          <Metric label="Mistakes logged" value={dashboard.mistakes.length} detail="All time" />
          <Metric label="Revision sessions" value={dashboard.revisions.length} detail="Scheduled and completed" />
          <Metric label="Patterns tracked" value={dashboard.patterns.length} detail="Confidence based" />
        </div>
      </Panel>
    </section>
  );
}

function Metric({ label, value, detail }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function Panel({ title, icon, action, children }) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <span className="eyebrow">{icon} Insight</span>
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </article>
  );
}

function TopicBars({ items, weak = false }) {
  return (
    <div className="topic-list">
      {items.map((item) => (
        <div className="topic-row" key={item.topic}>
          <header>
            <strong>{item.topic}</strong>
            <span>{item.strength}%</span>
          </header>
          <div className="bar-track">
            <div className={weak ? "bar-fill weak" : "bar-fill"} style={{ width: `${item.strength}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Badge({ children, tone = "info" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function Select({ name, options, placeholder }) {
  return (
    <select name={name} required>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function viewTitle(view) {
  return {
    dashboard: "Learning dashboard",
    analysis: "Analysis",
    mistakes: "Mistake workflow",
    revisions: "Revision plan",
    patterns: "Pattern mastery",
    profile: "Profile"
  }[view];
}
