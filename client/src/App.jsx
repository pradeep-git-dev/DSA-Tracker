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
  Search,
  Calendar,
  Award,
  Flame,
  Check,
  Edit3,
  Trash2
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

const questionBank = [
  { slug: "two-sum", title: "Two Sum", topic: "Array", difficulty: "Easy", pattern: "Hashing", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "contains-duplicate", title: "Contains Duplicate", topic: "Array", difficulty: "Easy", pattern: "Hashing", sheets: ["strivers", "neetcode"] },
  { slug: "valid-anagram", title: "Valid Anagram", topic: "Array", difficulty: "Easy", pattern: "Hashing", sheets: ["strivers", "neetcode"] },
  { slug: "group-anagrams", title: "Group Anagrams", topic: "Array", difficulty: "Medium", pattern: "Hashing", sheets: ["neetcode"] },
  { slug: "top-k-frequent-elements", title: "Top K Frequent Elements", topic: "Array", difficulty: "Medium", pattern: "Heap", sheets: ["neetcode"] },
  { slug: "product-of-array-except-self", title: "Product of Array Except Self", topic: "Array", difficulty: "Medium", pattern: "Prefix product", sheets: ["strivers", "gfg160", "neetcode"] },
  { slug: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", topic: "Array", difficulty: "Medium", pattern: "Hashing", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "maximum-subarray", title: "Maximum Subarray", topic: "Array", difficulty: "Medium", pattern: "Greedy", sheets: ["strivers", "gfg160"] },
  { slug: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", topic: "Array", difficulty: "Easy", pattern: "Greedy", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "majority-element", title: "Majority Element", topic: "Array", difficulty: "Easy", pattern: "Voting", sheets: ["strivers", "gfg160"] },
  { slug: "move-zeroes", title: "Move Zeroes", topic: "Array", difficulty: "Easy", pattern: "Two pointers", sheets: ["strivers"] },
  { slug: "valid-palindrome", title: "Valid Palindrome", topic: "Two Pointers", difficulty: "Easy", pattern: "Two pointers", sheets: ["strivers", "neetcode"] },
  { slug: "two-sum-ii-input-array-is-sorted", title: "Two Sum II - Input Array Is Sorted", topic: "Two Pointers", difficulty: "Medium", pattern: "Two pointers", sheets: ["neetcode"] },
  { slug: "3sum", title: "3Sum", topic: "Two Pointers", difficulty: "Medium", pattern: "Two pointers", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "container-with-most-water", title: "Container With Most Water", topic: "Two Pointers", difficulty: "Medium", pattern: "Two pointers", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "trapping-rain-water", title: "Trapping Rain Water", topic: "Two Pointers", difficulty: "Hard", pattern: "Two pointers", sheets: ["strivers", "neetcode"] },
  { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", topic: "Sliding Window", difficulty: "Medium", pattern: "Variable window", sheets: ["strivers", "neetcode"] },
  { slug: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", topic: "Sliding Window", difficulty: "Medium", pattern: "Variable window", sheets: ["neetcode"] },
  { slug: "minimum-window-substring", title: "Minimum Window Substring", topic: "Sliding Window", difficulty: "Hard", pattern: "Variable window", sheets: ["neetcode"] },
  { slug: "binary-search", title: "Binary Search", topic: "Binary Search", difficulty: "Easy", pattern: "Binary Search", sheets: ["strivers", "neetcode"] },
  { slug: "search-a-2d-matrix", title: "Search a 2D Matrix", topic: "Binary Search", difficulty: "Medium", pattern: "Binary Search", sheets: ["strivers", "neetcode"] },
  { slug: "koko-eating-bananas", title: "Koko Eating Bananas", topic: "Binary Search", difficulty: "Medium", pattern: "Search space", sheets: ["neetcode"] },
  { slug: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", pattern: "Boundary search", sheets: ["neetcode"] },
  { slug: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", pattern: "Modified binary search", sheets: ["strivers", "neetcode"] },
  { slug: "valid-parentheses", title: "Valid Parentheses", topic: "Stack", difficulty: "Easy", pattern: "Stack", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "min-stack", title: "Min Stack", topic: "Stack", difficulty: "Medium", pattern: "Stack", sheets: ["neetcode"] },
  { slug: "daily-temperatures", title: "Daily Temperatures", topic: "Stack", difficulty: "Medium", pattern: "Monotonic stack", sheets: ["neetcode"] },
  { slug: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", topic: "Stack", difficulty: "Hard", pattern: "Monotonic stack", sheets: ["strivers", "neetcode"] },
  { slug: "reverse-linked-list", title: "Reverse Linked List", topic: "Linked List", difficulty: "Easy", pattern: "Pointer reversal", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "Easy", pattern: "Two pointers", sheets: ["strivers", "gfg160", "neetcode"] },
  { slug: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", topic: "Linked List", difficulty: "Medium", pattern: "Two pointers", sheets: ["strivers", "neetcode"] },
  { slug: "linked-list-cycle", title: "Linked List Cycle", topic: "Linked List", difficulty: "Easy", pattern: "Fast/slow pointers", sheets: ["strivers", "neetcode"] },
  { slug: "lru-cache", title: "LRU Cache", topic: "Linked List", difficulty: "Medium", pattern: "Design", sheets: ["strivers", "neetcode"] },
  { slug: "merge-k-sorted-lists", title: "Merge K Sorted Lists", topic: "Linked List", difficulty: "Hard", pattern: "Divide and conquer", sheets: ["strivers", "neetcode"] },
  { slug: "invert-binary-tree", title: "Invert Binary Tree", topic: "Tree", difficulty: "Easy", pattern: "DFS", sheets: ["neetcode"] },
  { slug: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", topic: "Tree", difficulty: "Easy", pattern: "DFS", sheets: ["strivers", "neetcode"] },
  { slug: "diameter-of-binary-tree", title: "Diameter of Binary Tree", topic: "Tree", difficulty: "Easy", pattern: "DFS", sheets: ["neetcode"] },
  { slug: "balanced-binary-tree", title: "Balanced Binary Tree", topic: "Tree", difficulty: "Easy", pattern: "DFS", sheets: ["strivers", "neetcode"] },
  { slug: "same-tree", title: "Same Tree", topic: "Tree", difficulty: "Easy", pattern: "DFS", sheets: ["strivers", "neetcode"] },
  { slug: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", topic: "Tree", difficulty: "Easy", pattern: "DFS", sheets: ["strivers", "neetcode"] },
  { slug: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", topic: "Tree", difficulty: "Medium", pattern: "BFS", sheets: ["strivers", "neetcode"] },
  { slug: "validate-binary-search-tree", title: "Validate Binary Search Tree", topic: "Tree", difficulty: "Medium", pattern: "DFS", sheets: ["strivers", "neetcode"] },
  { slug: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", topic: "Tree", difficulty: "Medium", pattern: "DFS", sheets: ["strivers", "neetcode"] },
  { slug: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", topic: "Heap (Priority Queue)", difficulty: "Medium", pattern: "Heap", sheets: ["strivers", "neetcode"] },
  { slug: "task-scheduler", title: "Task Scheduler", topic: "Heap (Priority Queue)", difficulty: "Medium", pattern: "Heap", sheets: ["neetcode"] },
  { slug: "find-median-from-data-stream", title: "Find Median from Data Stream", topic: "Heap (Priority Queue)", difficulty: "Hard", pattern: "Heap", sheets: ["strivers", "neetcode"] },
  { slug: "subsets", title: "Subsets", topic: "Backtracking", difficulty: "Medium", pattern: "Backtracking", sheets: ["gfg160", "neetcode"] },
  { slug: "combination-sum", title: "Combination Sum", topic: "Backtracking", difficulty: "Medium", pattern: "Backtracking", sheets: ["strivers", "gfg160", "neetcode"] },
  { slug: "permutations", title: "Permutations", topic: "Backtracking", difficulty: "Medium", pattern: "Backtracking", sheets: ["strivers", "neetcode"] },
  { slug: "word-search", title: "Word Search", topic: "Backtracking", difficulty: "Medium", pattern: "Backtracking", sheets: ["strivers", "neetcode"] },
  { slug: "n-queens", title: "N-Queens", topic: "Backtracking", difficulty: "Hard", pattern: "Backtracking", sheets: ["strivers", "neetcode"] },
  { slug: "number-of-islands", title: "Number of Islands", topic: "Graph", difficulty: "Medium", pattern: "DFS/BFS", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "clone-graph", title: "Clone Graph", topic: "Graph", difficulty: "Medium", pattern: "Graph traversal", sheets: ["neetcode"] },
  { slug: "course-schedule", title: "Course Schedule", topic: "Graph", difficulty: "Medium", pattern: "Topological sort", sheets: ["gfg160", "neetcode", "strivers"] },
  { slug: "network-delay-time", title: "Network Delay Time", topic: "Graph", difficulty: "Medium", pattern: "Dijkstra", sheets: ["neetcode"] },
  { slug: "climbing-stairs", title: "Climbing Stairs", topic: "Dynamic Programming", difficulty: "Easy", pattern: "1D DP", sheets: ["strivers", "neetcode"] },
  { slug: "house-robber", title: "House Robber", topic: "Dynamic Programming", difficulty: "Medium", pattern: "1D DP", sheets: ["strivers", "neetcode"] },
  { slug: "longest-palindromic-substring", title: "Longest Palindromic Substring", topic: "Dynamic Programming", difficulty: "Medium", pattern: "String DP", sheets: ["strivers", "neetcode"] },
  { slug: "coin-change", title: "Coin Change", topic: "Dynamic Programming", difficulty: "Medium", pattern: "1D DP", sheets: ["strivers", "neetcode"] },
  { slug: "word-break", title: "Word Break", topic: "Dynamic Programming", difficulty: "Medium", pattern: "String DP", sheets: ["neetcode"] },
  { slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", topic: "Dynamic Programming", difficulty: "Medium", pattern: "DP with binary search", sheets: ["strivers", "neetcode"] },
  { slug: "partition-equal-subset-sum", title: "Partition Equal Subset Sum", topic: "Dynamic Programming", difficulty: "Medium", pattern: "Knapsack", sheets: ["strivers", "neetcode"] },
  { slug: "longest-common-subsequence", title: "Longest Common Subsequence", topic: "Dynamic Programming", difficulty: "Medium", pattern: "Matrix DP", sheets: ["strivers", "neetcode"] },
  { slug: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", topic: "Trie", difficulty: "Medium", pattern: "Trie", sheets: ["neetcode"] },
  { slug: "number-of-1-bits", title: "Number of 1 Bits", topic: "Bit Manipulation", difficulty: "Easy", pattern: "Bit tricks", sheets: ["neetcode"] },
  { slug: "accounts-merge", title: "Accounts Merge", topic: "Union Find", difficulty: "Medium", pattern: "Union Find", sheets: ["neetcode"] }
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
          {mode === "register" && (
            <input 
              name="leetcodeUsername" 
              placeholder="LeetCode username" 
              pattern="^[A-Za-z0-9_-]+$" 
              title="Only letters, numbers, underscores, and hyphens allowed" 
              required 
            />
          )}
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
                manuallySolvedSlugs={manuallySolvedSlugs}
                toggleSolvedSlug={toggleSolvedSlug}
              />
            )}
            {view === "analysis" && <Analysis dashboard={dashboard} onAnalyze={runAnalysis} />}
            {view === "mistakes" && <Mistakes dashboard={dashboard} api={api} onChanged={refreshDashboard} />}
            {view === "revisions" && <Revisions dashboard={dashboard} api={api} onChanged={refreshDashboard} />}
            {view === "patterns" && <Patterns dashboard={dashboard} api={api} onChanged={refreshDashboard} manuallySolvedSlugs={manuallySolvedSlugs} toggleSolvedSlug={toggleSolvedSlug} />}
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

function Dashboard({ dashboard, onRefresh, onAnalyze, manuallySolvedSlugs, toggleSolvedSlug }) {
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

      <Recommendations recommendations={recommendations} dashboard={dashboard} manuallySolvedSlugs={manuallySolvedSlugs} toggleSolvedSlug={toggleSolvedSlug} />
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

      {report.leetcodeMistakes && report.leetcodeMistakes.length > 0 && (
        <Panel title="LeetCode Wrong Submissions (Mistakes Detected)">
          <div className="card-list">
            {report.leetcodeMistakes.map((mistake, idx) => (
              <div key={idx} style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--danger)" }}>❌</span>
                <span>{mistake}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

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
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = Object.fromEntries(form);
    try {
      await api("/api/mistakes", { method: "POST", body: JSON.stringify(payload) });
      formEl.reset();
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
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");

  async function scheduleCustom(event) {
    event.preventDefault();
    setError("");
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = Object.fromEntries(form);
    try {
      await api("/api/revisions", { method: "POST", body: JSON.stringify(payload) });
      formEl.reset();
      await onChanged("Custom spaced repetition schedule created.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleComplete(id, currentStatus) {
    const nextStatus = currentStatus === "completed" ? "scheduled" : "completed";
    try {
      if (nextStatus === "completed") {
        await api(`/api/revisions/${id}/complete`, {
          method: "PATCH",
          body: JSON.stringify({ reflection: "Completed from calendar." })
        });
      } else {
        await api(`/api/revisions/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "scheduled" })
        });
      }
      await onChanged(`Revision session marked as ${nextStatus}.`);
      setSelectedDaySessions(null);
    } catch (err) {
      setError(err.message);
    }
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
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push({ day: null, isPadding: true });
  }

  const today = new Date();
  const isToday = (d) => {
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(year, month, d);
    const daySessions = (dashboard.revisions || []).filter((session) => {
      const sDate = new Date(session.scheduledFor);
      return sDate.getDate() === d && sDate.getMonth() === month && sDate.getFullYear() === year;
    });
    daysGrid.push({ day: d, date: dDate, sessions: daySessions, today: isToday(d) });
  }

  // Calculate Streak
  const calculateStreak = (revisionsList) => {
    if (!revisionsList || revisionsList.length === 0) return 0;

    const sorted = [...revisionsList].sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    let streak = 0;
    const now = new Date();

    for (let i = sorted.length - 1; i >= 0; i--) {
      const r = sorted[i];
      const sched = new Date(r.scheduledFor);

      if (sched > now && r.status === "scheduled") {
        continue;
      }

      if (r.status === "completed") {
        streak += 1;
      } else if (r.status === "skipped" || (r.status === "scheduled" && (now - sched) > 24 * 60 * 60 * 1000)) {
        break;
      }
    }
    return streak;
  };

  const completedCount = (dashboard.revisions || []).filter((r) => r.status === "completed").length;
  const currentStreak = calculateStreak(dashboard.revisions);

  // Next scheduled
  const nextScheduled = (dashboard.revisions || [])
    .filter((r) => r.status === "scheduled" && new Date(r.scheduledFor) >= today)
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0];

  // Pattern wise revision score
  const patternScores = {};
  (dashboard.revisions || []).forEach((r) => {
    const key = r.pattern || r.focusTopic;
    if (!patternScores[key]) {
      patternScores[key] = { scheduled: 0, completed: 0 };
    }
    patternScores[key].scheduled += 1;
    if (r.status === "completed") {
      patternScores[key].completed += 1;
    }
  });

  return (
    <section className="stack">
      {/* Revision Analytics Header */}
      <div className="metric-grid mini" style={{ marginBottom: "12px" }}>
        <article className="metric-card" style={{ borderLeft: "4px solid var(--good)" }}>
          <span className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Award size={14} /> Completed</span>
          <strong>{completedCount}</strong>
          <small>Total completed revisions</small>
        </article>
        <article className="metric-card" style={{ borderLeft: "4px solid var(--brand)" }}>
          <span className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Flame size={14} /> Streak</span>
          <strong>{currentStreak} Day{currentStreak !== 1 ? "s" : ""}</strong>
          <small>Consecutive active days</small>
        </article>
        <article className="metric-card" style={{ borderLeft: "4px solid var(--ink)" }}>
          <span className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={14} /> Next Up</span>
          <strong style={{ fontSize: "1.1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {nextScheduled ? nextScheduled.title : "None scheduled"}
          </strong>
          <small>{nextScheduled ? new Date(nextScheduled.scheduledFor).toLocaleDateString() : "All caught up!"}</small>
        </article>
      </div>

      {/* Full-width Calendar */}
      <Panel title="Revision Calendar" action={
        <div className="calendar-header-nav">
          <button className="calendar-nav-btn" onClick={prevMonth}>&lt;</button>
          <strong className="calendar-month-title">{monthNames[month]} {year}</strong>
          <button className="calendar-nav-btn" onClick={nextMonth}>&gt;</button>
        </div>
      }>
        <div className="calendar-weekdays">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="calendar-grid">
          {daysGrid.map((cell, idx) => {
            if (cell.isPadding) {
              return <div key={`pad-${idx}`} className="calendar-cell-pad" />;
            }
            const hasSessions = cell.sessions.length > 0;
            return (
              <div
                key={`day-${cell.day}`}
                onClick={() => setSelectedDaySessions(cell)}
                className={`calendar-cell ${cell.today ? "calendar-cell-today" : ""} ${hasSessions ? "calendar-cell-has-sessions" : ""}`}
              >
                <div className="calendar-day-num">
                  <span>{cell.day}</span>
                  {cell.today && <span className="calendar-today-badge">Today</span>}
                </div>
                {hasSessions && (
                  <div className="calendar-sessions-container">
                    {cell.sessions.map((s) => (
                      <span
                        key={s._id}
                        title={`${s.title} (${s.status})`}
                        className={`calendar-session-pill ${s.status === "completed" ? "completed" : "scheduled"}`}
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

      {/* Selected Day Checklist overlay (Also Full Width) */}
      {selectedDaySessions && (
        <div className="selected-day-panel">
          <div className="selected-day-header">
            <h3>Revisions for {selectedDaySessions.date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <button className="selected-day-close" onClick={() => setSelectedDaySessions(null)}>✕</button>
          </div>
          {selectedDaySessions.sessions.length === 0 ? (
            <p className="selected-day-empty">No sessions scheduled for this day.</p>
          ) : (
            <div className="selected-day-list">
              {selectedDaySessions.sessions.map((session) => {
                const isEditing = editingSessionId === session._id;
                return (
                  <div key={session._id} className="selected-day-item" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="selected-day-item-left" style={{ flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={session.status === "completed"}
                          onChange={() => toggleComplete(session._id, session.status)}
                          className="selected-day-checkbox"
                        />
                        {isEditing ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", paddingLeft: "10px" }}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Session Title"
                              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", width: "100%" }}
                            />
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", width: "100%" }}
                            />
                          </div>
                        ) : (
                          <div className="selected-day-info">
                            <strong className={`selected-day-title ${session.status === "completed" ? "completed" : ""}`}>
                              {session.title}
                            </strong>
                            <span className="selected-day-subtitle">
                              {session.pattern ? `${session.focusTopic} • ${session.pattern}` : session.focusTopic}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Badge tone={session.status === "completed" ? "good" : "info"}>{session.status}</Badge>
                        
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => {
                                setEditingSessionId(session._id);
                                setEditTitle(session.title);
                                setEditDate(new Date(session.scheduledFor).toISOString().split('T')[0]);
                              }}
                              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", padding: "4px" }}
                              title="Edit schedule"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to delete this revision session?")) {
                                  try {
                                    await api(`/api/revisions/${session._id}`, { method: "DELETE" });
                                    await onChanged("Revision session deleted.");
                                    setSelectedDaySessions(null);
                                  } catch (err) {
                                    setError(err.message);
                                  }
                                }
                              }}
                              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", padding: "4px" }}
                              title="Delete schedule"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingLeft: "32px" }}>
                        <button
                          onClick={() => setEditingSessionId(null)}
                          style={{ padding: "4px 10px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await api(`/api/revisions/${session._id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ title: editTitle, scheduledFor: new Date(editDate) })
                              });
                              await onChanged("Revision session updated.");
                              setEditingSessionId(null);
                              setSelectedDaySessions(null);
                            } catch (err) {
                              setError(err.message);
                            }
                          }}
                          style={{ padding: "4px 10px", fontSize: "12px", borderRadius: "4px", border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer" }}
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedule Form and Pattern Scores side-by-side below calendar */}
      <div className="grid two">
        {/* Spaced Repetition Form */}
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
                  Comma-separated day offsets from today.
                </small>
              </div>
            </div>
            {error && <p className="error" style={{ gridColumn: "1 / -1" }}>{error}</p>}
            <button className="primary-action" style={{ gridColumn: "1 / -1" }}>Create Schedule</button>
          </form>
        </Panel>

        {/* Pattern Wise Revision Score */}
        <Panel title="Pattern Completion Scores">
          <div className="card-list compact" style={{ maxHeight: "310px", overflowY: "auto", paddingRight: "4px" }}>
            {Object.keys(patternScores).length === 0 ? (
              <Empty text="No scheduled patterns to score yet." />
            ) : (
              Object.entries(patternScores).map(([name, data]) => {
                const rate = Math.round((data.completed / data.scheduled) * 100);
                return (
                  <div key={name} style={{ display: "flex", flexDirection: "column", gap: "6px", borderBottom: "1px solid var(--line)", paddingBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <strong>{name}</strong>
                      <span>{data.completed}/{data.scheduled} ({rate}%)</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${rate}%`, background: rate >= 70 ? "var(--good)" : rate >= 40 ? "var(--warn)" : "var(--brand)" }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </div>
    </section>
  );
}

function Patterns({ dashboard, manuallySolvedSlugs = [], toggleSolvedSlug }) {
  const [expandedTopic, setExpandedTopic] = useState(null);

  const getCombinedSolvedSet = () => {
    const solved = new Set([...manuallySolvedSlugs]);
    const solvedStats = dashboard.leetcode?.counts?.solved || { easy: 0, medium: 0, hard: 0 };
    if (solvedStats.easy > 0 || solvedStats.medium > 0 || solvedStats.hard > 0) {
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;
      questionBank.forEach((q) => {
        if (q.difficulty === "Easy" && easyCount < solvedStats.easy) {
          solved.add(q.slug);
          easyCount++;
        } else if (q.difficulty === "Medium" && mediumCount < solvedStats.medium) {
          solved.add(q.slug);
          mediumCount++;
        } else if (q.difficulty === "Hard" && hardCount < solvedStats.hard) {
          solved.add(q.slug);
          hardCount++;
        }
      });
    }
    (dashboard.leetcode?.recentAccepted || []).forEach((q) => solved.add(q.titleSlug));
    (dashboard.leetcode?.recentSubmissions || [])
      .filter((q) => q.statusDisplay === "Accepted")
      .forEach((q) => solved.add(q.titleSlug));
    return solved;
  };

  const getComparisonData = () => {
    const leetcodeSolvedSlugs = getCombinedSolvedSet();

    const topicMap = {};
    questionBank.forEach((q) => {
      if (!topicMap[q.topic]) {
        topicMap[q.topic] = {
          topic: q.topic,
          strivers: { solved: 0, total: 0 },
          neetcode: { solved: 0, total: 0 },
          gfg160: { solved: 0, total: 0 }
        };
      }
      const isSolved = leetcodeSolvedSlugs.has(q.slug);
      q.sheets.forEach((sheet) => {
        if (topicMap[q.topic][sheet]) {
          topicMap[q.topic][sheet].total += 1;
          if (isSolved) {
            topicMap[q.topic][sheet].solved += 1;
          }
        }
      });
    });

    return Object.values(topicMap).map((item) => {
      const striversPct = item.strivers.total ? Math.round((item.strivers.solved / item.strivers.total) * 100) : 0;
      const neetcodePct = item.neetcode.total ? Math.round((item.neetcode.solved / item.neetcode.total) * 100) : 0;
      const gfg160Pct = item.gfg160.total ? Math.round((item.gfg160.solved / item.gfg160.total) * 100) : 0;

      return {
        topic: item.topic,
        striversSolved: item.strivers.solved,
        striversTotal: item.strivers.total,
        striversPct,
        neetcodeSolved: item.neetcode.solved,
        neetcodeTotal: item.neetcode.total,
        neetcodePct,
        gfg160Solved: item.gfg160.solved,
        gfg160Total: item.gfg160.total,
        gfg160Pct,
        averageStrength: Math.round((striversPct + neetcodePct + gfg160Pct) / 3)
      };
    }).sort((a, b) => b.averageStrength - a.averageStrength);
  };

  const insights = getComparisonData();

  const leetcodeSolvedSlugs = getCombinedSolvedSet();

  return (
    <section className="stack">
      <div className="grid two">
        <Panel title="DSA Sheets Pattern Strength Comparison">
          {insights.length === 0 ? (
            <Empty text="No data available." />
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={insights}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="topic" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="striversPct" fill="var(--brand)" name="Strivers A-Z %" />
                <Bar dataKey="neetcodePct" fill="#f59e0b" name="NeetCode %" />
                <Bar dataKey="gfg160Pct" fill="#10b981" name="GFG 160 %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Detailed Topic Comparison">
          {insights.length === 0 ? (
            <Empty text="No data available." />
          ) : (
            <div className="card-list compact" style={{ maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
              {insights.map((item) => {
                const isExpanded = expandedTopic === item.topic;
                const topicQuestions = questionBank.filter((q) => q.topic === item.topic);

                return (
                  <article className="item-card" key={item.topic} style={{ cursor: "pointer" }} onClick={() => setExpandedTopic(isExpanded ? null : item.topic)}>
                    <header>
                      <strong>{item.topic} {isExpanded ? "▼" : "▶"}</strong>
                      <Badge tone={item.averageStrength >= 70 ? "good" : item.averageStrength >= 40 ? "warn" : "danger"}>
                        Avg: {item.averageStrength}% Strength
                      </Badge>
                    </header>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "8px", fontSize: "11px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ color: "var(--brand)", fontWeight: "bold" }}>Strivers</span>
                        <span>{item.striversSolved}/{item.striversTotal} ({item.striversPct}%)</span>
                        <div className="bar-track" style={{ height: "4px" }}>
                          <div className="bar-fill" style={{ width: `${item.striversPct}%`, background: "var(--brand)" }} />
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ color: "#f59e0b", fontWeight: "bold" }}>NeetCode</span>
                        <span>{item.neetcodeSolved}/{item.neetcodeTotal} ({item.neetcodePct}%)</span>
                        <div className="bar-track" style={{ height: "4px" }}>
                          <div className="bar-fill" style={{ width: `${item.neetcodePct}%`, background: "#f59e0b" }} />
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>GFG 160</span>
                        <span>{item.gfg160Solved}/{item.gfg160Total} ({item.gfg160Pct}%)</span>
                        <div className="bar-track" style={{ height: "4px" }}>
                          <div className="bar-fill" style={{ width: `${item.gfg160Pct}%`, background: "#10b981" }} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", color: "var(--muted)", marginBottom: "4px" }}>
                          Questions checklist (Check to mark Solved):
                        </div>
                        {topicQuestions.map((q) => {
                          const solved = leetcodeSolvedSlugs.has(q.slug);
                          return (
                            <div key={q.slug} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "6px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                  type="checkbox"
                                  checked={solved}
                                  onChange={() => toggleSolvedSlug(q.slug)}
                                  style={{ cursor: "pointer" }}
                                />
                                <a href={`https://leetcode.com/problems/${q.slug}/`} target="_blank" rel="noreferrer" style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink)", textDecoration: "none" }}>
                                  {q.title}
                                </a>
                              </div>
                              <div style={{ display: "flex", gap: "4px" }}>
                                {q.sheets.map((s) => (
                                  <Badge key={s} tone={s === "strivers" ? "info" : s === "neetcode" ? "warn" : s === "good"}>
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}

function Recommendations({ recommendations, dashboard, manuallySolvedSlugs = [], toggleSolvedSlug }) {
  const [recMode, setRecMode] = useState("mistakes");

  const getDynamicRecommendations = () => {
    const leetcodeSolvedSlugs = new Set([
      ...(dashboard.leetcode?.recentAccepted || []).map((q) => q.titleSlug),
      ...(dashboard.leetcode?.recentSubmissions || [])
        .filter((q) => q.statusDisplay === "Accepted")
        .map((q) => q.titleSlug),
      ...manuallySolvedSlugs
    ]);

    const unsolvedQuestions = questionBank.filter((q) => !leetcodeSolvedSlugs.has(q.slug));

    if (recMode === "mistakes") {
      const openMistakes = (dashboard.mistakes || []).filter((m) => m.status !== "resolved");
      if (openMistakes.length === 0) {
        return (recommendations.questions || []).slice(0, 8);
      }

      return unsolvedQuestions.map((q) => {
        let score = 0;
        openMistakes.forEach((m) => {
          if (m.topic === q.topic) score += 20;
          if (m.pattern === q.pattern) score += 30;
          if (m.severity >= 4 && m.topic === q.topic) score += 15;
        });
        return {
          ...q,
          score,
          reason: `Matches topic/pattern of your logged mistakes.`
        };
      }).filter((q) => q.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    } else if (recMode === "patterns") {
      const topicInsights = dashboard.topicInsights || [];
      const weakestTopics = new Set(topicInsights.slice(0, 3).map((t) => t.topic));

      return unsolvedQuestions.map((q) => {
        const isWeak = weakestTopics.has(q.topic);
        return {
          ...q,
          score: isWeak ? 50 : 10,
          reason: isWeak ? `Focus topic to boost pattern mastery.` : `Build coverage.`
        };
      }).sort((a, b) => b.score - a.score)
        .slice(0, 8);
    } else {
      const sheetQs = unsolvedQuestions.filter((q) => q.sheets.includes(recMode));
      return sheetQs.map((q) => ({
        ...q,
        reason: `Unsolved question from the ${recMode === "neetcode" ? "NeetCode" : recMode === "strivers" ? "Strivers A-Z" : "GFG 160"} sheet.`
      })).slice(0, 8);
    }
  };

  const currentRecs = getDynamicRecommendations();

  return (
    <Panel 
      title="Adaptive Practice Queue" 
      icon={<Activity size={18} />}
      action={
        <select 
          value={recMode} 
          onChange={(e) => setRecMode(e.target.value)}
          style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontSize: "12px", fontWeight: "600" }}
        >
          <option value="mistakes">Focus: Logged Mistakes</option>
          <option value="patterns">Focus: Pattern Weakness</option>
          <option value="neetcode">Sheet: NeetCode</option>
          <option value="strivers">Sheet: Strivers A-Z</option>
          <option value="gfg160">Sheet: GFG 160</option>
        </select>
      }
    >
      {currentRecs.length === 0 ? (
        <Empty text="All questions in this selection are completed! Nice job." />
      ) : (
        <div className="question-grid">
          {currentRecs.map((question) => (
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
      )}
    </Panel>
  );
}

function Profile({ dashboard }) {
  const profile = dashboard.leetcode?.profile || {};
  const latest = dashboard.leetcode;

  const buildHeatmapData = () => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83); // 12 weeks
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay); // Align to Sunday

    const activityMap = {};

    (dashboard.mistakes || []).forEach((m) => {
      const dateStr = new Date(m.createdAt).toDateString();
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    });

    (dashboard.revisions || []).forEach((r) => {
      if (r.status === "completed" && r.completedAt) {
        const dateStr = new Date(r.completedAt).toDateString();
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    });

    const tempDate = new Date(startDate);
    for (let i = 0; i < 84; i++) {
      const dateStr = tempDate.toDateString();
      const count = activityMap[dateStr] || 0;
      data.push({
        date: new Date(tempDate),
        count
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return data;
  };

  const heatmapData = buildHeatmapData();

  return (
    <section className="stack">
      <div className="grid two">
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
      </div>

      <Panel title="Activity Heatmap" icon={<Activity size={18} />}>
        <div style={{ padding: "12px", background: "var(--surface-2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
          <div style={{ display: "grid", gridTemplateRows: "repeat(7, 13px)", gridAutoFlow: "column", gap: "4px", justifyContent: "start", overflowX: "auto", paddingBottom: "8px" }}>
            {heatmapData.map((day, index) => {
              const level = Math.min(4, day.count);
              return (
                <div
                  key={index}
                  title={`${day.date.toLocaleDateString()}: ${day.count} activities`}
                  style={{
                    width: "13px",
                    height: "13px",
                    borderRadius: "3px",
                    background: level === 0 
                      ? "var(--surface)" 
                      : `color-mix(in srgb, var(--brand) ${level * 25}%, var(--surface))`,
                    border: "1px solid var(--line)",
                    transition: "all 0.1s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.15)";
                    e.currentTarget.style.borderColor = "var(--brand)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--line)";
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "11px", color: "var(--muted)" }}>
            <span>Last 12 weeks of logged mistakes & completed revisions</span>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span>Less</span>
              <div style={{ width: "10px", height: "10px", background: "var(--surface)", border: "1px solid var(--line)" }} />
              <div style={{ width: "10px", height: "10px", background: "color-mix(in srgb, var(--brand) 25%, var(--surface))", border: "1px solid var(--line)" }} />
              <div style={{ width: "10px", height: "10px", background: "color-mix(in srgb, var(--brand) 50%, var(--surface))", border: "1px solid var(--line)" }} />
              <div style={{ width: "10px", height: "10px", background: "color-mix(in srgb, var(--brand) 75%, var(--surface))", border: "1px solid var(--line)" }} />
              <div style={{ width: "10px", height: "10px", background: "var(--brand)", border: "1px solid var(--line)" }} />
              <span>More</span>
            </div>
          </div>
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
