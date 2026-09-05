import React from "react";
import { Moon, Sun, Activity, BarChart3, RefreshCw, Search, CheckCircle2, AlertTriangle } from "lucide-react";

export default function LandingPage({ onAuth, theme, toggleTheme }) {
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
