import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  LogOut,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Target,
  UserRound
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

  if (loading) return <Splash />;
  if (!user) return <AuthScreen />;

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

function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
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
    <main className="auth-shell">
      <section className="auth-copy">
        <span className="brand-badge">
          <ShieldCheck size={18} /> Secure DSA workspace
        </span>
        <h1>Track the mistake, revise the pattern, move the curve.</h1>
        <p>
          A LeetCode-connected workflow for logging real mistakes, generating revision sessions, and choosing the next
          question from your actual weak signals.
        </p>
        <div className="security-list">
          <span>HTTP-only refresh cookies</span>
          <span>bcrypt password hashing</span>
          <span>Rate-limited auth and sync</span>
        </div>
      </section>

      <form className="auth-card" onSubmit={submit}>
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
        <button className="primary-action" disabled={busy}>
          {busy ? "Working..." : mode === "register" ? "Create secure account" : "Enter dashboard"}
        </button>
      </form>
    </main>
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

  const navItems = [
    ["dashboard", BarChart3, "Dashboard"],
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
            {view === "dashboard" && <Dashboard dashboard={dashboard} onRefresh={() => refreshDashboard("Dashboard refreshed.")} />}
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

function Dashboard({ dashboard, onRefresh }) {
  const { metrics, topicInsights, uncoveredTopics, recommendations, learningCurve } = dashboard;
  const accuracy = metrics.submissions.all ? Math.round((metrics.solved.all / metrics.submissions.all) * 100) : 0;
  const strongest = [...topicInsights].sort((a, b) => b.strength - a.strength).slice(0, 5);
  const weakest = topicInsights.slice(0, 5);

  return (
    <section className="stack">
      <div className="metric-grid">
        <Metric label="Solved" value={metrics.solved.all} detail={`E ${metrics.solved.easy} · M ${metrics.solved.medium} · H ${metrics.solved.hard}`} />
        <Metric label="Accuracy" value={`${accuracy}%`} detail="Accepted vs submissions" />
        <Metric label="Active days" value={metrics.activeDays} detail={`Current streak ${metrics.streak}`} />
        <Metric label="Due revisions" value={metrics.dueRevisions} detail={`${metrics.openMistakes} open mistakes`} />
        <Metric label="Patterns complete" value={metrics.completedPatterns} detail="Tracked in app" />
      </div>

      <div className="grid two">
        <Panel title="Learning Curve" action={<button onClick={onRefresh}>Refresh</button>}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={learningCurve}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area dataKey="solved" stroke="#2563eb" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Rule-Based Report" icon={<Brain size={18} />}>
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

  async function review(id, resolved) {
    await api(`/api/mistakes/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ resolved })
    });
    await onChanged(resolved ? "Mistake resolved." : "Mistake reviewed.");
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
                  <span>{mistake.topic} · {mistake.pattern} · severity {mistake.severity}</span>
                </div>
                <Badge tone={mistake.status === "resolved" ? "good" : "warn"}>{mistake.status}</Badge>
              </header>
              <p>{mistake.rootCause}</p>
              <div className="actions">
                <button onClick={() => review(mistake._id, false)}>Reviewed</button>
                <button onClick={() => review(mistake._id, true)}>Resolve</button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Revisions({ dashboard, api, onChanged }) {
  async function generate() {
    await api("/api/revisions/generate", { method: "POST" });
    await onChanged("Revision plan regenerated from live weak signals.");
  }

  async function complete(id) {
    await api(`/api/revisions/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ reflection: "Completed from dashboard." })
    });
    await onChanged("Revision session completed.");
  }

  return (
    <section className="stack">
      <Panel title="Revision Sessions" action={<button onClick={generate}>Generate plan</button>}>
        <div className="card-list">
          {dashboard.revisions.length === 0 && <Empty text="Generate your first revision plan after syncing LeetCode or logging mistakes." />}
          {dashboard.revisions.map((session) => (
            <article className="item-card" key={session._id}>
              <header>
                <div>
                  <strong>{session.title}</strong>
                  <span>{new Date(session.scheduledFor).toLocaleDateString()} · {session.durationMinutes} min</span>
                </div>
                <Badge tone={session.status === "completed" ? "good" : "info"}>{session.status}</Badge>
              </header>
              <p>{session.plan}</p>
              {session.status === "scheduled" && <button onClick={() => complete(session._id)}>Mark complete</button>}
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Patterns({ dashboard, api, onChanged }) {
  async function savePattern(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    await api("/api/patterns", { method: "PUT", body: JSON.stringify(payload) });
    event.currentTarget.reset();
    await onChanged("Pattern progress updated.");
  }

  return (
    <section className="grid two">
      <Panel title="Update Pattern">
        <form className="form-grid" onSubmit={savePattern}>
          <Select name="pattern" options={patterns} placeholder="Pattern" />
          <Select name="topic" options={topics} placeholder="Topic" />
          <select name="status" defaultValue="learning">
            <option value="not-started">Not started</option>
            <option value="learning">Learning</option>
            <option value="practicing">Practicing</option>
            <option value="complete">Complete</option>
          </select>
          <input name="confidence" type="number" min="0" max="100" placeholder="Confidence 0-100" />
          <input name="solvedCount" type="number" min="0" placeholder="Solved count" />
          <button className="primary-action">Save pattern</button>
        </form>
      </Panel>
      <Panel title="Pattern Progress">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dashboard.patterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pattern" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="confidence" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
        <div className="card-list compact">
          {dashboard.patterns.map((pattern) => (
            <article className="item-card" key={pattern._id}>
              <header>
                <strong>{pattern.pattern}</strong>
                <Badge tone={pattern.status === "complete" ? "good" : "info"}>{pattern.status}</Badge>
              </header>
              <span>{pattern.topic} · confidence {pattern.confidence}% · solved {pattern.solvedCount}</span>
            </article>
          ))}
        </div>
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
            <span>{question.topic} · {question.pattern}</span>
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
              <p>Rank {profile.ranking?.toLocaleString() || "unknown"} · Reputation {profile.reputation || 0}</p>
              <p>{profile.countryName || ""} {profile.company ? `· ${profile.company}` : ""}</p>
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
    mistakes: "Mistake workflow",
    revisions: "Revision plan",
    patterns: "Pattern mastery",
    profile: "Profile"
  }[view];
}
