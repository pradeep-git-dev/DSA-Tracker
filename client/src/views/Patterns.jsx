import React, { useState } from "react";
import { Activity, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import Panel from "../components/ui/Panel.jsx";
import Metric from "../components/ui/Metric.jsx";
import Badge from "../components/ui/Badge.jsx";
import Empty from "../components/ui/Empty.jsx";
import { questionBank } from "../domain/recommendationEngine.js";

export default function Patterns({ dashboard, manuallySolvedSlugs = [], toggleSolvedSlug }) {
  const [expandedTopic, setExpandedTopic] = useState(null);

  const getCombinedSolvedSet = () => {
    const solved = new Set([...manuallySolvedSlugs]);
    const solvedStats = dashboard.leetcode?.counts?.solved || { easy: 0, medium: 0, hard: 0 };
    if (solvedStats.easy > 0 || solvedStats.medium > 0 || solvedStats.hard > 0) {
      let easyCount = 0, mediumCount = 0, hardCount = 0;
      questionBank.forEach((q) => {
        if (q.difficulty === "Easy" && easyCount < solvedStats.easy) { solved.add(q.slug); easyCount++; }
        else if (q.difficulty === "Medium" && mediumCount < solvedStats.medium) { solved.add(q.slug); mediumCount++; }
        else if (q.difficulty === "Hard" && hardCount < solvedStats.hard) { solved.add(q.slug); hardCount++; }
      });
    }
    (dashboard.leetcode?.recentAccepted || []).forEach((q) => solved.add(q.titleSlug));
    (dashboard.leetcode?.recentSubmissions || []).filter((q) => q.statusDisplay === "Accepted").forEach((q) => solved.add(q.titleSlug));
    return solved;
  };

  const leetcodeSolvedSlugs = getCombinedSolvedSet();
  const topicsList = Array.from(new Set(questionBank.map((q) => q.topic)));
  const difficultyWeights = { Easy: 1, Medium: 2, Hard: 3 };

  const topicData = topicsList.map((topic) => {
    const qList = questionBank.filter((q) => q.topic === topic);
    const solvedList = qList.filter((q) => leetcodeSolvedSlugs.has(q.slug));
    const unsolvedList = qList.filter((q) => !leetcodeSolvedSlugs.has(q.slug));

    const solvedEasy = solvedList.filter((q) => q.difficulty === "Easy").length;
    const solvedMedium = solvedList.filter((q) => q.difficulty === "Medium").length;
    const solvedHard = solvedList.filter((q) => q.difficulty === "Hard").length;
    const totalEasy = qList.filter((q) => q.difficulty === "Easy").length;
    const totalMedium = qList.filter((q) => q.difficulty === "Medium").length;
    const totalHard = qList.filter((q) => q.difficulty === "Hard").length;

    const solvedWeightScore = solvedEasy * difficultyWeights.Easy + solvedMedium * difficultyWeights.Medium + solvedHard * difficultyWeights.Hard;
    const maxWeightScore = totalEasy * difficultyWeights.Easy + totalMedium * difficultyWeights.Medium + totalHard * difficultyWeights.Hard;
    const mastery = maxWeightScore > 0 ? Math.round((solvedWeightScore / maxWeightScore) * 100) : 0;
    const coveragePct = qList.length > 0 ? Math.round((solvedList.length / qList.length) * 100) : 0;
    const lacksExposure = solvedEasy > 0 && solvedMedium === 0 && solvedHard === 0 && (totalMedium > 0 || totalHard > 0);
    const prioritizedUnsolved = [...unsolvedList].sort((a, b) => difficultyWeights[b.difficulty] - difficultyWeights[a.difficulty]).slice(0, 5);

    return { topic, solvedCount: solvedList.length, totalCount: qList.length, coveragePct, mastery, solvedEasy, solvedMedium, solvedHard, totalEasy, totalMedium, totalHard, lacksExposure, prioritizedUnsolved, solvedWeightScore, maxWeightScore, allQuestions: qList };
  });

  const sortedTopics = [...topicData].sort((a, b) => b.mastery - a.mastery);
  const totalSolvedWeight = topicData.reduce((sum, t) => sum + t.solvedWeightScore, 0);
  const totalMaxWeight = topicData.reduce((sum, t) => sum + t.maxWeightScore, 0);
  const overallMasteryScore = totalMaxWeight > 0 ? Math.round((totalSolvedWeight / totalMaxWeight) * 100) : 0;
  const strongPatterns = topicData.filter((t) => t.mastery >= 70).sort((a, b) => b.mastery - a.mastery);
  const weakPatterns = topicData.filter((t) => t.mastery < 70).sort((a, b) => a.mastery - b.mastery);
  const totalSolvedCount = topicData.reduce((sum, t) => sum + t.solvedCount, 0);
  const totalSheetQuestions = topicData.reduce((sum, t) => sum + t.totalCount, 0);

  let readinessLevel = "Needs Solid Practice";
  let readinessDescription = "Focus on covering high-impact problems in weak patterns to build foundational depth.";
  let readinessColor = "var(--danger)";
  if (overallMasteryScore >= 80 && weakPatterns.length <= 2) {
    readinessLevel = "Strong Readiness";
    readinessDescription = "Excellent coverage of core patterns. Ready for top product-based companies. Keep revising!";
    readinessColor = "var(--good)";
  } else if (overallMasteryScore >= 50 && weakPatterns.length <= 6) {
    readinessLevel = "Moderate Readiness";
    readinessDescription = "Good foundational coverage, but key weak spots remain. Strengthen medium/hard questions in weak areas.";
    readinessColor = "var(--warn)";
  }

  return (
    <section className="stack">
      <div className="metric-grid">
        <Metric label="Curated Mastery" value={`${overallMasteryScore}%`} detail="Weighted depth score" />
        <Metric label="Sheet Coverage" value={`${totalSolvedCount} / ${totalSheetQuestions}`} detail={`${Math.round((totalSolvedCount / totalSheetQuestions) * 100 || 0)}% of interview lists`} />
        <Metric label="Weak Patterns" value={weakPatterns.length} detail="Mastery below 70%" />
        <Metric label="Strong Patterns" value={strongPatterns.length} detail="Mastery 70% or higher" />
        <article className="metric-card" style={{ borderLeft: `4px solid ${readinessColor}` }}>
          <span>Interview Readiness</span>
          <strong style={{ color: readinessColor }}>{readinessLevel}</strong>
          <small>{readinessDescription}</small>
        </article>
      </div>

      <div className="grid two">
        <Panel title="Pattern Mastery Radar" icon={<Activity size={18} />}>
          {sortedTopics.length === 0 ? (
            <Empty text="No data available." />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={sortedTopics}>
                <PolarGrid stroke="var(--line)" />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 9, fill: "var(--ink)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Mastery %" dataKey="mastery" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.2} />
                <Tooltip formatter={(value) => [`${value}%`, "Mastery"]} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Mastery Priority Areas">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Weak Patterns (Weakest First)</h4>
              {weakPatterns.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>No weak patterns detected! Great job.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {weakPatterns.map((t) => (
                    <span key={t.topic} style={{ background: "rgba(220, 38, 38, 0.08)", color: "var(--danger)", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>
                      {t.topic} ({t.mastery}%)
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--good)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Strong Patterns</h4>
              {strongPatterns.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>No strong patterns yet. Keep practicing!</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {strongPatterns.map((t) => (
                    <span key={t.topic} style={{ background: "rgba(22, 163, 74, 0.08)", color: "var(--good)", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>
                      {t.topic} ({t.mastery}%)
                    </span>
                  ))}
                </div>
              )}
            </div>

            {topicData.some((t) => t.lacksExposure) && (
              <div style={{ border: "1px solid var(--warn)", background: "rgba(234, 88, 12, 0.04)", padding: "12px", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "12px", color: "var(--warn)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <AlertTriangle size={14} /> Lack of Medium/Hard Exposure
                </h4>
                <p style={{ fontSize: "12px", margin: 0, lineHeight: "1.4" }}>
                  You have solved only Easy questions in the following patterns. You need Medium/Hard practice to pass product-based screeners:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {topicData.filter((t) => t.lacksExposure).map((t) => (
                    <span key={t.topic} style={{ fontSize: "11px", fontWeight: "700", color: "var(--warn)" }}>• {t.topic}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Curated Sheet Patterns Mastery Table">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th style={{ padding: "12px 8px" }}>DSA Pattern / Topic</th>
                <th style={{ padding: "12px 8px" }}>Curated Mastery</th>
                <th style={{ padding: "12px 8px" }}>Sheet Coverage</th>
                <th style={{ padding: "12px 8px" }}>Difficulty (E / M / H Solved)</th>
                <th style={{ padding: "12px 8px" }}>Exposure Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedTopics.map((t) => {
                const isExpanded = expandedTopic === t.topic;
                return (
                  <React.Fragment key={t.topic}>
                    <tr style={{ borderBottom: "1px solid var(--line)", cursor: "pointer", background: isExpanded ? "var(--surface-2)" : "transparent" }}
                      onClick={() => setExpandedTopic(isExpanded ? null : t.topic)}>
                      <td style={{ padding: "12px 8px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {t.topic}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "700", minWidth: "36px" }}>{t.mastery}%</span>
                          <div className="bar-track" style={{ width: "80px", height: "6px" }}>
                            <div className="bar-fill" style={{ width: `${t.mastery}%`, background: t.mastery >= 70 ? "var(--good)" : t.mastery >= 40 ? "var(--warn)" : "var(--danger)" }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 8px" }}>{t.solvedCount} / {t.totalCount} ({t.coveragePct}%)</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ color: "var(--good)" }}>{t.solvedEasy}</span> / <span style={{ color: "var(--warn)" }}>{t.solvedMedium}</span> / <span style={{ color: "var(--danger)" }}>{t.solvedHard}</span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        {t.lacksExposure ? <Badge tone="warn">Lacks Med/Hard</Badge> : t.mastery >= 70 ? <Badge tone="good">Solid Depth</Badge> : <Badge tone="info">Needs Volume</Badge>}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} style={{ padding: "16px", background: "var(--surface-2)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: t.prioritizedUnsolved.length > 0 ? "1fr 1fr" : "1fr", gap: "16px" }}>
                            <div>
                              <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--ink)", textTransform: "uppercase" }}>Questions Checklist ({t.solvedCount} Solved / {t.totalCount} Total)</h5>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "240px", overflowY: "auto" }}>
                                {t.allQuestions.map((q) => {
                                  const solved = leetcodeSolvedSlugs.has(q.slug);
                                  return (
                                    <div key={q.slug} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "6px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <input type="checkbox" checked={solved} onChange={() => toggleSolvedSlug(q.slug)} style={{ cursor: "pointer" }} />
                                        <a href={`https://leetcode.com/problems/${q.slug}/`} target="_blank" rel="noreferrer" style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink)", textDecoration: "none" }}>{q.title}</a>
                                      </div>
                                      <div style={{ display: "flex", gap: "4px" }}>
                                        {(q.sheets || []).map((s) => (
                                          <Badge key={s} tone={s === "strivers" ? "info" : s === "neetcode" ? "warn" : "good"}>{s}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {t.prioritizedUnsolved.length > 0 && (
                              <div>
                                <h5 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--warn)", textTransform: "uppercase" }}>High-Value Unsolved Recommendations</h5>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  {t.prioritizedUnsolved.map((q) => (
                                    <div key={q.slug} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px", border: "1px dashed var(--warn)", background: "rgba(234, 88, 12, 0.02)", borderRadius: "6px" }}>
                                      <a href={`https://leetcode.com/problems/${q.slug}/`} target="_blank" rel="noreferrer" style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink)", textDecoration: "none" }}>{q.title}</a>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Badge tone={q.difficulty === "Hard" ? "danger" : q.difficulty === "Medium" ? "warn" : "good"}>{q.difficulty}</Badge>
                                        <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "bold" }}>
                                          {(q.sheets && q.sheets.includes("strivers") && q.sheets.includes("gfg160")) ? "Both Sheets" : (q.sheets?.[0] || "General")}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}
