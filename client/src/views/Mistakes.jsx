import React, { useState } from "react";
import { Brain, AlertTriangle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Panel from "../components/ui/Panel.jsx";
import Badge from "../components/ui/Badge.jsx";
import Empty from "../components/ui/Empty.jsx";
import Select from "../components/ui/Select.jsx";
import { topics, patterns } from "../constants/topics.js";
import { createMistake, reviewMistake } from "../services/mistakeService.js";
import {
  calculateMistakePatternAnalytics,
  buildWeeklyMistakeTrend,
  formatCategoryLabel
} from "../services/mistakeAnalyticsService.js";

export default function Mistakes({ dashboard, onChanged }) {
  const [error, setError] = useState("");

  async function addMistake(event) {
    event.preventDefault();
    setError("");
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = Object.fromEntries(form);
    try {
      await createMistake(payload);
      formEl.reset();
      await onChanged("Mistake recorded and revision pressure recalculated.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function review(id, resolved, rating = "hint") {
    try {
      const mistake = dashboard.mistakes.find((m) => (m.id || m._id) === id);
      const topicInsight = dashboard.topicInsights?.find((t) => t.topic === mistake?.topic);
      const currentProf = topicInsight ? topicInsight.strength / 100 : 0.5;
      await reviewMistake(id, { resolved, rating, currentProficiencyScore: currentProf });
      await onChanged(resolved ? "Mistake resolved." : `Mistake reviewed: ${rating}`);
    } catch (err) {
      setError(err.message);
    }
  }

  // Compute analytics (Phase 2)
  const allMistakes = dashboard.mistakes || [];
  const patternAnalytics = calculateMistakePatternAnalytics(allMistakes);
  const weeklyTrend = buildWeeklyMistakeTrend(allMistakes);

  // Bar chart data for category recurrence
  const categoryChartData = Object.entries(patternAnalytics).map(([cat, stats]) => ({
    category: formatCategoryLabel(cat),
    count: stats.count,
    resolved: stats.resolved,
    unresolved: stats.count - stats.resolved
  }));

  return (
    <section className="stack">
      {/* Existing two-column: form + list */}
      <div className="grid two">
        <Panel title="Record Mistake">
          <form className="form-grid" onSubmit={addMistake}>
            <input name="problemTitle" placeholder="Problem title" required />
            <input name="problemSlug" placeholder="leetcode-slug (optional)" />
            <Select name="topic" options={topics} placeholder="Topic" />
            <Select name="pattern" options={patterns} placeholder="Pattern" />
            <select name="mistakeType" required>
              <option value="">Mistake type</option>
              <option value="concept">Concept Gap</option>
              <option value="edge-case">Edge Case</option>
              <option value="implementation">Implementation</option>
              <option value="complexity">Complexity</option>
              <option value="pattern-choice">Pattern Choice</option>
              <option value="dry-run">Dry Run</option>
            </select>
            <select name="severity" defaultValue="3">
              <option value="1">Severity 1 – Minor</option>
              <option value="2">Severity 2 – Low</option>
              <option value="3">Severity 3 – Medium</option>
              <option value="4">Severity 4 – High</option>
              <option value="5">Severity 5 – Critical</option>
            </select>
            <textarea name="rootCause" placeholder="Root cause" required />
            <textarea name="correction" placeholder="Correction or invariant" />
            <input name="triggerClues" placeholder="Trigger clue in problem (e.g., sorted array)" />
            <input name="coreInvariant" placeholder="Core invariant / approach logic" />
            <input name="commonPitfalls" placeholder="Common pitfall to avoid" />
            {error && <p className="error">{error}</p>}
            <button className="primary-action">Save mistake</button>
          </form>
        </Panel>

        <Panel title="Mistake Workflow">
          <div className="card-list">
            {allMistakes.length === 0 ? (
              <Empty text="No mistakes logged yet. Record your first mistake to get started." />
            ) : (
              allMistakes.map((mistake) => (
                <article className="item-card" key={mistake._id}>
                  <header>
                    <div>
                      <strong>{mistake.problemTitle}</strong>
                      <span>{mistake.topic} - {mistake.pattern} - severity {mistake.severity}</span>
                    </div>
                    <Badge tone={mistake.status === "resolved" ? "good" : "warn"}>{mistake.status}</Badge>
                  </header>
                  <p>{mistake.rootCause}</p>
                  {(mistake.triggerClues || mistake.coreInvariant || mistake.commonPitfalls) && (
                    <div style={{ background: "rgba(245, 158, 11, 0.05)", borderLeft: "3px solid var(--warn)", padding: "10px", borderRadius: "6px", margin: "10px 0", fontSize: "12px", lineHeight: "1.5", color: "var(--ink)" }}>
                      <div style={{ fontWeight: "700", color: "var(--warn)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                        <Brain size={14} /> Intuition Helper (Live LeetCode Analysis)
                      </div>
                      {mistake.triggerClues && (
                        <div style={{ marginBottom: "4px" }}>
                          <strong>🎯 Trigger Clue:</strong> {mistake.triggerClues}
                        </div>
                      )}
                      {mistake.coreInvariant && (
                        <div style={{ marginBottom: "4px" }}>
                          <strong>🧠 Core Invariant:</strong> {mistake.coreInvariant}
                        </div>
                      )}
                      {mistake.commonPitfalls && (
                        <div>
                          <strong>⚠️ Common Pitfall:</strong> {mistake.commonPitfalls}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                    <button style={{ background: "var(--danger)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, false, "failed")}>Failed</button>
                    <button style={{ background: "var(--warn)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, false, "hint")}>Hint Used</button>
                    <button style={{ background: "var(--good)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, false, "easy")}>Easy Solve</button>
                    <button style={{ background: "var(--brand)", color: "#fff", fontSize: "12px", border: "none", padding: "6px 12px", borderRadius: "4px" }} onClick={() => review(mistake._id, true, "easy")}>Resolve</button>
                  </div>
                </article>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Mistake Pattern Analytics Panel (Phase 2) */}
      {allMistakes.length > 0 && (
        <Panel title="Mistake Pattern Recurrence Analysis" icon={<AlertTriangle size={18} />}>
          <div className="grid two" style={{ gap: "24px" }}>
            {/* Category stat cards */}
            <div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Category Breakdown — {allMistakes.length} Total Mistakes
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {Object.entries(patternAnalytics).map(([cat, stats]) => (
                  <div key={cat} style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "capitalize", color: "var(--muted)", marginBottom: "6px" }}>
                      {formatCategoryLabel(cat)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--ink)", lineHeight: 1 }}>{stats.count}</div>
                        <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>occurrences</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: stats.recurrenceRate >= 30 ? "var(--danger)" : "var(--warn)" }}>
                          {stats.recurrenceRate}% recur
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: stats.resolutionRate >= 60 ? "var(--good)" : "var(--muted)" }}>
                          {stats.resolutionRate}% resolved
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="bar-track" style={{ marginTop: "8px", height: "4px" }}>
                      <div className="bar-fill" style={{ width: `${stats.resolutionRate}%`, background: stats.resolutionRate >= 60 ? "var(--good)" : "var(--warn)" }} />
                    </div>
                    {stats.affectedTopics.length > 0 && (
                      <div style={{ marginTop: "6px", fontSize: "10px", color: "var(--muted)" }}>
                        Topics: {stats.affectedTopics.slice(0, 3).join(", ")}
                        {stats.affectedTopics.length > 3 ? ` +${stats.affectedTopics.length - 3}` : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Category bar chart + weekly trend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {categoryChartData.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Resolved vs Unresolved per Category
                  </h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={categoryChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="resolved" stackId="a" fill="var(--good)" name="Resolved" />
                      <Bar dataKey="unresolved" stackId="a" fill="var(--danger)" name="Unresolved" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {weeklyTrend.some((w) => w.logged > 0) && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    8-Week Mistake Trend
                  </h4>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="logged" fill="var(--warn)" name="Logged" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="resolved" fill="var(--good)" name="Resolved" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </Panel>
      )}
    </section>
  );
}
