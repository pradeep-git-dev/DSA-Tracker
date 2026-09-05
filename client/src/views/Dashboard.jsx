import React, { useState } from "react";
import { Activity, Brain, ChevronRight } from "lucide-react";
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
import Panel from "../components/ui/Panel.jsx";
import Metric from "../components/ui/Metric.jsx";
import TopicBars from "../components/ui/TopicBars.jsx";
import Badge from "../components/ui/Badge.jsx";
import Empty from "../components/ui/Empty.jsx";
import { calculateResolutionMetrics } from "../services/resolutionMetricsService.js";
import { questionBank } from "../domain/recommendationEngine.js";

// ─── Dashboard view ────────────────────────────────────────────────────────
export default function Dashboard({ dashboard, onRefresh, manuallySolvedSlugs, toggleSolvedSlug }) {
  const { metrics, attemptStats, topicInsights, uncoveredTopics, recommendations, learningCurve } = dashboard;
  const accuracy = metrics.submissions.all ? Math.round((metrics.solved.all / metrics.submissions.all) * 100) : 0;
  const strongest = [...topicInsights].sort((a, b) => b.strength - a.strength).slice(0, 5);
  const weakest = topicInsights.slice(0, 5);

  // Resolution metrics (Phase 4)
  const resolutionMetrics = calculateResolutionMetrics(dashboard.mistakes || []);

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
              <Area dataKey="solved" stroke="var(--brand)" fill="rgba(220, 38, 38, 0.15)" name="Solved Problems" />
              <Area dataKey="mistakes" stroke="var(--warn)" fill="rgba(245, 158, 11, 0.15)" name="Active Mistakes" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Dynamic Report" icon={<Brain size={18} />}>
          <div className="report">
            <p>{recommendations.report.summary}</p>
            <p>{recommendations.report.diagnosis}</p>
            <p>{recommendations.report.nextAction}</p>
          </div>
        </Panel>
      </div>

      {/* Resolution Analytics Panel (Phase 4) */}
      {resolutionMetrics.total > 0 && (
        <Panel title="Resolution Analytics" icon={<Activity size={18} />}>
          <div className="metric-grid mini" style={{ marginBottom: "16px" }}>
            <article className="metric-card" style={{ borderLeft: "4px solid var(--good)" }}>
              <span>Resolution Rate</span>
              <strong style={{ color: "var(--good)" }}>{resolutionMetrics.resolutionRate}%</strong>
              <small>{resolutionMetrics.resolved} of {resolutionMetrics.total} resolved</small>
            </article>
            <article className="metric-card" style={{ borderLeft: "4px solid var(--warn)" }}>
              <span>Still Open</span>
              <strong style={{ color: "var(--warn)" }}>{resolutionMetrics.unresolved}</strong>
              <small>Unresolved mistakes</small>
            </article>
            <article className="metric-card" style={{ borderLeft: "4px solid var(--brand)" }}>
              <span>Avg. Time to Resolve</span>
              <strong>{resolutionMetrics.avgTimeToResolve > 0 ? `${resolutionMetrics.avgTimeToResolve}d` : "N/A"}</strong>
              <small>From log to resolution</small>
            </article>
          </div>

          {resolutionMetrics.chartData.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Topic-Level Resolution
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={resolutionMetrics.chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="topic" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Resolved" stackId="a" fill="var(--good)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Unresolved" stackId="a" fill="var(--danger)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category-wise resolution rates */}
          {Object.keys(resolutionMetrics.categoryResolution).length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Category Resolution Rates
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.entries(resolutionMetrics.categoryResolution).map(([cat, s]) => (
                  <div key={cat} style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "8px 12px", minWidth: "120px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "capitalize", color: "var(--ink)", marginBottom: "4px" }}>
                      {cat.replace(/-/g, " ")}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: s.rate >= 60 ? "var(--good)" : s.rate >= 30 ? "var(--warn)" : "var(--danger)" }}>
                      {s.rate}%
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--muted)" }}>{s.resolved}/{s.total} resolved</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      )}

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

// ─── Recommendations panel (internal to Dashboard view) ───────────────────
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

    const unsolvedQuestions = questionBank.filter(
      (q) => !leetcodeSolvedSlugs.has(q.slug) && (q.sheets.includes("strivers") || q.sheets.includes("gfg160"))
    );

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
        return { ...q, score, reason: `Matches topic/pattern of your logged mistakes.` };
      }).filter((q) => q.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    } else if (recMode === "patterns") {
      const topicInsights = dashboard.topicInsights || [];
      const weakestTopics = new Set(topicInsights.slice(0, 3).map((t) => t.topic));

      return unsolvedQuestions.map((q) => {
        const isWeak = weakestTopics.has(q.topic);
        return { ...q, score: isWeak ? 50 : 10, reason: isWeak ? `Focus topic to boost pattern mastery.` : `Build coverage.` };
      }).sort((a, b) => b.score - a.score).slice(0, 8);
    } else {
      const sheetQs = unsolvedQuestions.filter((q) => q.sheets.includes(recMode));
      return sheetQs.map((q) => ({
        ...q,
        reason: `Unsolved question from the ${recMode === "strivers" ? "Strivers A-Z" : "GFG 160"} sheet.`
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
