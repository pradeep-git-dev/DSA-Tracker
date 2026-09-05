import React, { useState } from "react";
import { Award, Brain, Calendar, ChevronRight, Edit3, Flame, Trash2, X } from "lucide-react";
import Panel from "../components/ui/Panel.jsx";
import Badge from "../components/ui/Badge.jsx";
import Empty from "../components/ui/Empty.jsx";
import Select from "../components/ui/Select.jsx";
import { topics } from "../constants/topics.js";
import { questionBank } from "../domain/recommendationEngine.js";
import { createCustomRevisionSessions, updateRevisionSession, deleteRevisionSession, completeRevisionSession } from "../services/revisionService.js";
import { generateAdaptiveRevisionQueue, scoreToTone } from "../services/revisionScoringService.js";

export default function Revisions({ dashboard, onChanged }) {
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
      await createCustomRevisionSessions(payload);
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
        await completeRevisionSession(id, "Completed from calendar.");
      } else {
        await updateRevisionSession(id, { status: "scheduled" });
      }
      await onChanged(`Revision session marked as ${nextStatus}.`);
      setSelectedDaySessions(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Adaptive revision queue (Phase 3)
  const adaptiveQueue = generateAdaptiveRevisionQueue(
    dashboard.mistakes || [],
    dashboard.revisions || [],
    questionBank
  );

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysGrid = [];
  for (let i = 0; i < firstDayIndex; i++) daysGrid.push({ day: null, isPadding: true });

  const today = new Date();
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  for (let d = 1; d <= daysInMonth; d++) {
    const dDate = new Date(year, month, d);
    const daySessions = (dashboard.revisions || []).filter((session) => {
      const sDate = new Date(session.scheduledFor);
      return sDate.getDate() === d && sDate.getMonth() === month && sDate.getFullYear() === year;
    });
    daysGrid.push({ day: d, date: dDate, sessions: daySessions, today: isToday(d) });
  }

  const calculateStreak = (revisionsList) => {
    if (!revisionsList || revisionsList.length === 0) return 0;
    const sorted = [...revisionsList].sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    let streak = 0;
    const now = new Date();
    for (let i = sorted.length - 1; i >= 0; i--) {
      const r = sorted[i];
      const sched = new Date(r.scheduledFor);
      if (sched > now && r.status === "scheduled") continue;
      if (r.status === "completed") streak += 1;
      else if (r.status === "skipped" || (r.status === "scheduled" && (now - sched) > 24 * 60 * 60 * 1000)) break;
    }
    return streak;
  };

  const completedCount = (dashboard.revisions || []).filter((r) => r.status === "completed").length;
  const currentStreak = calculateStreak(dashboard.revisions);
  const nextScheduled = (dashboard.revisions || [])
    .filter((r) => r.status === "scheduled" && new Date(r.scheduledFor) >= today)
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0];

  const patternScores = {};
  (dashboard.revisions || []).forEach((r) => {
    const key = r.pattern || r.focusTopic;
    if (!patternScores[key]) patternScores[key] = { scheduled: 0, completed: 0 };
    patternScores[key].scheduled += 1;
    if (r.status === "completed") patternScores[key].completed += 1;
  });

  return (
    <section className="stack">
      {/* Adaptive Priority Queue (Phase 3) */}
      {adaptiveQueue.length > 0 && (
        <Panel title="Adaptive Priority Queue (0–100 Score)" icon={<Brain size={18} />}>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
            Problems ranked by weighted score: Severity (35pts) · Attempt History (25pts) · Difficulty (20pts) · Recency (20pts)
          </p>
          <div className="card-list">
            {adaptiveQueue.slice(0, 10).map((item) => {
              const tone = scoreToTone(item.adaptiveScore);
              const scoreColor = tone === "danger" ? "var(--danger)" : tone === "warn" ? "var(--warn)" : "var(--good)";
              return (
                <article className="item-card" key={item.mistakeId} style={{ borderLeft: `3px solid ${scoreColor}` }}>
                  <header>
                    <div>
                      <strong>{item.problemTitle}</strong>
                      <span>{item.topic}{item.pattern ? ` — ${item.pattern}` : ""}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "52px" }}>
                      <span style={{ fontSize: "28px", fontWeight: "900", color: scoreColor, lineHeight: 1 }}>
                        {item.adaptiveScore}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: "600" }}>/ 100</span>
                    </div>
                  </header>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 8px" }}>{item.reason}</p>
                  {item.suggestedQuestion && (
                    <a
                      href={`https://leetcode.com/problems/${item.suggestedQuestion.slug}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="primary-action"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px", textDecoration: "none" }}
                    >
                      Practice Similar: {item.suggestedQuestion.title}
                      <ChevronRight size={14} />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
          {adaptiveQueue.length > 10 && (
            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--muted)", marginTop: "8px" }}>
              +{adaptiveQueue.length - 10} more in queue — resolve high-priority items first.
            </p>
          )}
        </Panel>
      )}

      {/* Revision stats header */}
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

      {/* Calendar */}
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
            if (cell.isPadding) return <div key={`pad-${idx}`} className="calendar-cell-pad" />;
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
                      <span key={s._id} title={`${s.title} (${s.status})`} className={`calendar-session-pill ${s.status === "completed" ? "completed" : "scheduled"}`}>
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

      {/* Day detail overlay */}
      {selectedDaySessions && (
        <div className="selected-day-panel">
          <div className="selected-day-header">
            <h3>Revisions for {selectedDaySessions.date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
            <button className="selected-day-close" onClick={() => setSelectedDaySessions(null)}><X size={16} /></button>
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
                            <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Session Title"
                              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", width: "100%" }} />
                            <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                              style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", width: "100%" }} />
                          </div>
                        ) : (
                          <div className="selected-day-info">
                            <strong className={`selected-day-title ${session.status === "completed" ? "completed" : ""}`}>{session.title}</strong>
                            <span className="selected-day-subtitle">
                              {session.pattern ? `${session.focusTopic} / ${session.pattern}` : session.focusTopic}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Badge tone={session.status === "completed" ? "good" : "info"}>{session.status}</Badge>
                        {!isEditing && (
                          <>
                            <button onClick={() => { setEditingSessionId(session._id); setEditTitle(session.title); setEditDate(new Date(session.scheduledFor).toISOString().split("T")[0]); }}
                              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "flex", padding: "4px" }} title="Edit schedule">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this revision session?")) {
                                try { await deleteRevisionSession(session._id); await onChanged("Revision session deleted."); setSelectedDaySessions(null); }
                                catch (err) { setError(err.message); }
                              }
                            }} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", padding: "4px" }} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingLeft: "32px" }}>
                        <button onClick={() => setEditingSessionId(null)} style={{ padding: "4px 10px", fontSize: "12px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer" }}>Cancel</button>
                        <button onClick={async () => {
                          try { await updateRevisionSession(session._id, { title: editTitle, scheduledFor: new Date(editDate).toISOString() }); await onChanged("Revision session updated."); setEditingSessionId(null); setSelectedDaySessions(null); }
                          catch (err) { setError(err.message); }
                        }} style={{ padding: "4px 10px", fontSize: "12px", borderRadius: "4px", border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer" }}>Save</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedule form + pattern scores */}
      <div className="grid two">
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
                <small style={{ color: "var(--muted)", fontSize: "11px", marginTop: "4px", display: "block" }}>Comma-separated day offsets from today.</small>
              </div>
            </div>
            {error && <p className="error" style={{ gridColumn: "1 / -1" }}>{error}</p>}
            <button className="primary-action" style={{ gridColumn: "1 / -1" }}>Create Schedule</button>
          </form>
        </Panel>

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
