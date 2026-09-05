import React from "react";
import { Activity, Award, BarChart3 } from "lucide-react";
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
import Metric from "../components/ui/Metric.jsx";
import Empty from "../components/ui/Empty.jsx";

export default function Profile({ dashboard }) {
  const profile = dashboard.leetcode?.profile || {};
  const latest = dashboard.leetcode;
  const contest = latest?.contest || null;

  // Build attempt stats chart data
  const topFailedProblems = (latest?.attemptStats?.problemAttempts || [])
    .filter((p) => p.failed > 0)
    .slice(0, 8)
    .map((p) => ({
      title: p.title.length > 18 ? p.title.slice(0, 16) + "…" : p.title,
      Failed: p.failed,
      Accepted: p.accepted
    }));

  // Activity heatmap (12 weeks)
  const buildHeatmapData = () => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83);
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const activityMap = {};
    const getLocalDateString = (dateInput) => {
      if (!dateInput) return "";
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return "";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    (dashboard.mistakes || []).forEach((m) => {
      const dateStr = getLocalDateString(m.createdAt);
      if (dateStr) activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    });
    (dashboard.revisions || []).forEach((r) => {
      if (r.status === "completed" && r.completedAt) {
        const dateStr = getLocalDateString(r.completedAt);
        if (dateStr) activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    });

    for (let i = 0; i < 84; i++) {
      const tempDate = new Date(startDate);
      tempDate.setDate(startDate.getDate() + i);
      const dateStr = getLocalDateString(tempDate);
      data.push({ date: tempDate, count: activityMap[dateStr] || 0 });
    }
    return data;
  };

  const heatmapData = buildHeatmapData();

  return (
    <section className="stack">
      <div className="grid two">
        {/* LeetCode profile */}
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

        {/* Contest stats (Phase 3) */}
        <Panel title="Contest Performance" icon={<Award size={18} />}>
          {!contest ? (
            <Empty text="Sync LeetCode to load contest ranking data." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="metric-grid mini">
                <article className="metric-card" style={{ borderLeft: "4px solid var(--brand)" }}>
                  <span>Contests Attended</span>
                  <strong>{contest.attendedContestsCount ?? "—"}</strong>
                  <small>Total competitions</small>
                </article>
                <article className="metric-card" style={{ borderLeft: "4px solid var(--good)" }}>
                  <span>Contest Rating</span>
                  <strong>{contest.rating ? Math.round(contest.rating) : "—"}</strong>
                  <small>LeetCode rating</small>
                </article>
                <article className="metric-card" style={{ borderLeft: "4px solid var(--warn)" }}>
                  <span>Global Rank</span>
                  <strong>{contest.globalRanking?.toLocaleString() ?? "—"}</strong>
                  <small>{contest.topPercentage ? `Top ${contest.topPercentage.toFixed(1)}%` : "All contestants"}</small>
                </article>
              </div>
              {contest.topPercentage && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--muted)" }}>Percentile standing</span>
                    <span style={{ fontWeight: "700", color: "var(--good)" }}>Top {contest.topPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${100 - contest.topPercentage}%`, background: "var(--good)" }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* In-App work summary */}
      <Panel title="Your Work In App">
        <div className="metric-grid mini">
          <Metric label="Mistakes logged" value={dashboard.mistakes.length} detail="All time" />
          <Metric label="Revision sessions" value={dashboard.revisions.length} detail="Scheduled and completed" />
          <Metric label="Patterns tracked" value={dashboard.patterns.length} detail="Confidence based" />
        </div>
      </Panel>

      {/* Submission attempt stats (Phase 3) */}
      {topFailedProblems.length > 0 && (
        <Panel title="Most Failed Problems (Submission Attempt Stats)" icon={<BarChart3 size={18} />}>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
            Problems with the highest failed attempt counts from your recent LeetCode submission history.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topFailedProblems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="title" type="category" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Failed" fill="var(--danger)" name="Failed Attempts" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Accepted" fill="var(--good)" name="Accepted" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {/* Activity heatmap */}
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
                    width: "13px", height: "13px", borderRadius: "3px",
                    background: level === 0 ? "var(--surface)" : `color-mix(in srgb, var(--brand) ${level * 25}%, var(--surface))`,
                    border: "1px solid var(--line)", transition: "all 0.1s ease", cursor: "pointer"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.borderColor = "var(--brand)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--line)"; }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "11px", color: "var(--muted)" }}>
            <span>Last 12 weeks of logged mistakes &amp; completed revisions</span>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span>Less</span>
              {[0, 25, 50, 75, 100].map((pct, i) => (
                <div key={i} style={{ width: "10px", height: "10px", background: pct === 0 ? "var(--surface)" : `color-mix(in srgb, var(--brand) ${pct}%, var(--surface))`, border: "1px solid var(--line)" }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
