import { supabase } from "../lib/supabase.js";

function normalizeRecord(rec) {
  if (!rec) return rec;
  return { ...rec, _id: rec.id };
}

export async function getPatterns() {
  const { data, error } = await supabase
    .from("pattern_progress")
    .select("*")
    .order("status", { ascending: true })
    .order("confidence", { ascending: true });

  if (error) throw error;
  return data.map(normalizeRecord);
}

export async function upsertPattern(patternData) {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    throw new Error("User must be authenticated to update pattern progress.");
  }

  const solvedCount = Number(patternData.solvedCount !== undefined ? patternData.solvedCount : (patternData.solved_count || 0));

  const payload = {
    user_id: userId,
    pattern: patternData.pattern,
    topic: patternData.topic,
    status: patternData.status || "learning",
    confidence: Number(patternData.confidence !== undefined ? patternData.confidence : 25),
    solved_count: solvedCount,
    last_practiced_at: solvedCount > 0 ? new Date().toISOString() : null
  };

  const { data, error } = await supabase
    .from("pattern_progress")
    .upsert(payload, { onConflict: "user_id, topic, pattern" })
    .select()
    .single();

  if (error) throw error;
  return normalizeRecord(data);
}

export async function getTopicProficiency() {
  const { data, error } = await supabase
    .from("topic_proficiency")
    .select("*");

  if (error) throw error;
  return data.map(normalizeRecord);
}
