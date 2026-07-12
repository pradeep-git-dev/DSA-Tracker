import { supabase } from "../lib/supabase.js";
import { buildMistakeCandidate } from "../domain/leetcodeAnalysis.js";
import { createMistake } from "./mistakeService.js";

function normalizeRecord(rec) {
  if (!rec) return rec;
  return { ...rec, _id: rec.id };
}

export async function getLatestSnapshot() {
  const { data, error } = await supabase
    .from("leetcode_snapshots")
    .select("*")
    .order("synced_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data && data.length > 0 ? normalizeRecord(data[0]) : null;
}

export async function getSnapshotsHistory(limit = 24) {
  const { data, error } = await supabase
    .from("leetcode_snapshots")
    .select("*")
    .order("synced_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data.map(normalizeRecord);
}

/**
 * Syncs LeetCode profile using the stateless proxy, saves snapshot if stats changed,
 * and auto-logs new mistake candidates.
 * @param {string} username - LeetCode username
 */
export async function syncLeetcodeProfile(username) {
  const response = await fetch("/api/leetcode/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "LeetCode synchronization proxy failed.");
  }

  const profileData = await response.json();

  // 1. Fetch latest snapshot in database to compare
  const latestSnapshot = await getLatestSnapshot();
  
  let shouldSave = false;
  if (!latestSnapshot) {
    shouldSave = true;
  } else {
    // Check if meaningful stats changed
    const newSolved = profileData.counts?.solved?.all || 0;
    const oldSolved = latestSnapshot.counts?.solved?.all || latestSnapshot.counts?.solvedAll || 0;
    
    const newSubmissions = profileData.counts?.submissions?.all || 0;
    const oldSubmissions = latestSnapshot.counts?.submissions?.all || latestSnapshot.counts?.submissionsAll || 0;

    const newActiveDays = profileData.calendar?.totalActiveDays || 0;
    const oldActiveDays = latestSnapshot.calendar?.totalActiveDays || latestSnapshot.calendar?.total_active_days || 0;

    if (newSolved !== oldSolved || newSubmissions !== oldSubmissions || newActiveDays !== oldActiveDays) {
      shouldSave = true;
    }
  }

  let savedSnapshot = null;
  if (shouldSave) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (userId) {
      const { data, error } = await supabase
        .from("leetcode_snapshots")
        .insert([{
          user_id: userId,
          username: profileData.username,
          profile: profileData.profile,
          counts: profileData.counts,
          calendar: profileData.calendar,
          recent_submissions: profileData.recentSubmissions,
          recent_accepted: profileData.recentAccepted,
          recent_questions: profileData.recentQuestions,
          topic_insights: profileData.topicInsights,
          attempt_stats: profileData.attemptStats,
          sync_quality: profileData.syncQuality,
          raw: profileData
        }])
        .select()
        .single();

      if (error) throw error;
      savedSnapshot = normalizeRecord(data);
    }
  }

  // 2. Scan and auto-log mistakes from failed submissions
  const questionMap = new Map();
  for (const q of profileData.recentQuestions || []) {
    questionMap.set(q.titleSlug || q.slug, q);
  }

  const wrongSubmissions = (profileData.recentSubmissions || []).filter(
    (submission) => submission.statusDisplay !== "Accepted"
  );

  // Fetch all user's unresolved mistakes
  const { data: unresolvedMistakes, error: fetchErr } = await supabase
    .from("mistakes")
    .select("problem_slug, mistake_type")
    .neq("status", "resolved");

  if (fetchErr) throw fetchErr;

  const unresolvedSet = new Set(
    (unresolvedMistakes || []).map((m) => `${m.problem_slug}:${m.mistake_type}`)
  );

  let newLoggedCount = 0;
  for (const submission of wrongSubmissions) {
    const question = questionMap.get(submission.titleSlug);
    const candidate = buildMistakeCandidate(submission, question);
    const key = `${candidate.problem_slug}:${candidate.mistake_type}`;

    if (!unresolvedSet.has(key)) {
      try {
        await createMistake(candidate);
        unresolvedSet.add(key); // prevent duplicates within same batch
        newLoggedCount++;
      } catch (err) {
        // Silently skip duplicate or failed insertion due to DB constraints
        console.warn("Skipping mistake logging:", err.message);
      }
    }
  }

  return {
    snapshot: savedSnapshot || latestSnapshot || normalizeRecord(profileData),
    newLoggedCount,
    changesDetected: shouldSave
  };
}
