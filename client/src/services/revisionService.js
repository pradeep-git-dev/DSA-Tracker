import { supabase } from "../lib/supabase.js";
import { generateRevisionBlueprint } from "../domain/recommendationEngine.js";

function normalizeRecord(rec) {
  if (!rec) return rec;
  return { ...rec, _id: rec.id };
}

export async function getRevisions() {
  // Fetch sessions
  const { data: sessions, error: sError } = await supabase
    .from("revision_sessions")
    .select("*")
    .order("scheduled_for", { ascending: true });

  if (sError) throw sError;

  // Fetch junction mappings
  const { data: mappings, error: mError } = await supabase
    .from("revision_session_mistakes")
    .select("revision_session_id, mistake_id");

  if (mError) throw mError;

  // Merge mappings into sessions
  const sessionMap = new Map(
    sessions.map((s) => [s.id, { ...normalizeRecord(s), mistakeRefs: [] }])
  );

  for (const mapping of mappings) {
    const session = sessionMap.get(mapping.revision_session_id);
    if (session) {
      session.mistakeRefs.push(mapping.mistake_id);
    }
  }

  return Array.from(sessionMap.values());
}

export async function createRevisionSession(sessionData) {
  const payload = {
    title: sessionData.title,
    focus_topic: sessionData.focusTopic || sessionData.focus_topic,
    pattern: sessionData.pattern || "",
    scheduled_for: sessionData.scheduledFor || sessionData.scheduled_for,
    duration_minutes: Number(sessionData.durationMinutes || sessionData.duration_minutes || 45),
    plan: sessionData.plan || "",
    status: sessionData.status || "scheduled"
  };

  const { data: session, error: sError } = await supabase
    .from("revision_sessions")
    .insert([payload])
    .select()
    .single();

  if (sError) throw sError;

  const mistakeRefs = sessionData.mistakeRefs || sessionData.mistake_refs || [];
  if (mistakeRefs.length > 0) {
    const junctionRows = mistakeRefs.map((mistakeId) => ({
      revision_session_id: session.id,
      mistake_id: mistakeId
    }));

    const { error: jError } = await supabase
      .from("revision_session_mistakes")
      .insert(junctionRows);

    if (jError) throw jError;
  }

  return {
    ...normalizeRecord(session),
    mistakeRefs
  };
}

export async function createCustomRevisionSessions(input) {
  const daysArr = input.scheduleDays.replace(/\s+/g, "").split(",").map(Number);
  const created = [];

  let currentScheduledDate = new Date();
  for (const days of daysArr) {
    currentScheduledDate.setDate(currentScheduledDate.getDate() + days);
    const scheduledFor = new Date(currentScheduledDate);

    const session = await createRevisionSession({
      title: `${input.pattern || input.topic} Revision`,
      focusTopic: input.topic,
      pattern: input.pattern || "",
      scheduledFor: scheduledFor.toISOString(),
      durationMinutes: 45,
      plan: `Spaced repetition drill for ${input.pattern || input.topic} (solved ${input.solvedCount} problems). Schedule point: Day gap ${days}.`
    });
    created.push(session);
  }
  return created;
}


export async function updateRevisionSession(id, updates) {
  const payload = {};
  if (updates.status !== undefined) {
    payload.status = updates.status;
    payload.completed_at = updates.status === "completed" ? new Date().toISOString() : null;
  }
  if (updates.scheduledFor !== undefined) payload.scheduled_for = updates.scheduledFor;
  if (updates.scheduled_for !== undefined) payload.scheduled_for = updates.scheduled_for;
  if (updates.title !== undefined) payload.title = updates.title;

  const { data: session, error } = await supabase
    .from("revision_sessions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Fetch updated mistake refs
  const { data: mappings, error: mError } = await supabase
    .from("revision_session_mistakes")
    .select("mistake_id")
    .eq("revision_session_id", id);

  const mistakeRefs = mError ? [] : mappings.map((m) => m.mistake_id);

  return {
    ...normalizeRecord(session),
    mistakeRefs
  };
}

export async function deleteRevisionSession(id) {
  const { error } = await supabase
    .from("revision_sessions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function completeRevisionSession(id, reflection = "") {
  const { error } = await supabase.rpc("complete_revision_session", {
    p_session_id: id,
    p_reflection: reflection
  });

  if (error) throw error;
}

export async function generateSessions(mistakes, topicInsights) {
  const blueprint = generateRevisionBlueprint({ mistakes, topicInsights });
  const created = [];

  for (const [index, item] of blueprint.entries()) {
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + index * 2);

    // Check for existing scheduled sessions on the same topic in the last 24 hours
    const { data: existing, error: eError } = await supabase
      .from("revision_sessions")
      .select("id")
      .eq("focus_topic", item.topic)
      .eq("status", "scheduled")
      .gte("scheduled_for", new Date(Date.now() - 86400000).toISOString());

    if (eError) throw eError;
    if (existing && existing.length > 0) continue;

    const mistakeRefs = item.mistakes.map((mistake) => mistake.id || mistake._id);
    const plan = buildSessionPlanText(item);

    const sessionPayload = {
      title: `${item.topic} revision`,
      focusTopic: item.topic,
      pattern: item.pattern,
      scheduledFor: scheduledFor.toISOString(),
      durationMinutes: item.mistakes.length > 2 ? 60 : 45,
      plan,
      mistakeRefs
    };

    const session = await createRevisionSession(sessionPayload);
    created.push(session);
  }

  return created;
}

function buildSessionPlanText(item) {
  const mistakeLine = item.mistakes.length
    ? `Review ${item.mistakes.length} logged mistake${item.mistakes.length > 1 ? "s" : ""}; rewrite the failed invariant and edge cases.`
    : "Rebuild the core idea from notes, then solve a fresh problem without looking at hints.";

  return `${mistakeLine} Drill pattern: ${item.pattern}. Finish by writing a three-line postmortem: signal missed, fix, and next trigger.`;
}
