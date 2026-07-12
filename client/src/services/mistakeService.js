import { supabase } from "../lib/supabase.js";
import { getInitialReviewDate, calculateSM2Review } from "../domain/reviewScheduler.js";

/**
 * Service handling mistakes table operations
 */

function normalizeRecord(rec) {
  if (!rec) return rec;
  return { ...rec, _id: rec.id };
}

export async function getMistakes() {
  const { data, error } = await supabase
    .from("mistakes")
    .select("*")
    .order("status", { ascending: true })
    .order("next_review_at", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(normalizeRecord);
}

export async function createMistake(mistakeData) {
  const nextReviewAt = mistakeData.next_review_at || mistakeData.nextReviewAt || getInitialReviewDate(mistakeData.severity || 3);
  
  const payload = {
    problem_title: mistakeData.problemTitle || mistakeData.problem_title,
    problem_slug: mistakeData.problemSlug || mistakeData.problem_slug || "",
    topic: mistakeData.topic,
    pattern: mistakeData.pattern || "General",
    mistake_type: mistakeData.mistakeType || mistakeData.mistake_type,
    root_cause: mistakeData.rootCause || mistakeData.root_cause,
    correction: mistakeData.correction || "",
    trigger_clues: mistakeData.triggerClues || mistakeData.trigger_clues || "",
    core_invariant: mistakeData.coreInvariant || mistakeData.core_invariant || "",
    common_pitfalls: mistakeData.commonPitfalls || mistakeData.common_pitfalls || "",
    severity: Number(mistakeData.severity || 3),
    status: mistakeData.status || "open",
    source: mistakeData.source || "manual",
    next_review_at: nextReviewAt
  };

  const { data, error } = await supabase
    .from("mistakes")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return normalizeRecord(data);
}

export async function updateMistake(id, updates) {
  const payload = {};
  
  // Normalize updates from frontend keys to PostgreSQL snake_case columns
  if (updates.problemTitle !== undefined) payload.problem_title = updates.problemTitle;
  if (updates.problem_title !== undefined) payload.problem_title = updates.problem_title;
  if (updates.problemSlug !== undefined) payload.problem_slug = updates.problemSlug;
  if (updates.problem_slug !== undefined) payload.problem_slug = updates.problem_slug;
  if (updates.topic !== undefined) payload.topic = updates.topic;
  if (updates.pattern !== undefined) payload.pattern = updates.pattern;
  if (updates.mistakeType !== undefined) payload.mistake_type = updates.mistakeType;
  if (updates.mistake_type !== undefined) payload.mistake_type = updates.mistake_type;
  if (updates.rootCause !== undefined) payload.root_cause = updates.rootCause;
  if (updates.root_cause !== undefined) payload.root_cause = updates.root_cause;
  if (updates.correction !== undefined) payload.correction = updates.correction;
  if (updates.triggerClues !== undefined) payload.trigger_clues = updates.triggerClues;
  if (updates.trigger_clues !== undefined) payload.trigger_clues = updates.trigger_clues;
  if (updates.coreInvariant !== undefined) payload.core_invariant = updates.coreInvariant;
  if (updates.core_invariant !== undefined) payload.core_invariant = updates.core_invariant;
  if (updates.commonPitfalls !== undefined) payload.common_pitfalls = updates.commonPitfalls;
  if (updates.common_pitfalls !== undefined) payload.common_pitfalls = updates.common_pitfalls;
  if (updates.severity !== undefined) payload.severity = Number(updates.severity);
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.nextReviewAt !== undefined) payload.next_review_at = updates.nextReviewAt;
  if (updates.next_review_at !== undefined) payload.next_review_at = updates.next_review_at;

  const { data, error } = await supabase
    .from("mistakes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return normalizeRecord(data);
}

export async function deleteMistake(id) {
  const { error } = await supabase
    .from("mistakes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Reviews a mistake using SM-2 scheduling, atomically committing updates to public.mistakes
 * and updating the user's topic proficiency via a PostgreSQL RPC function.
 * @param {string} id - Mistake UUID
 * @param {object} reviewData - { resolved, rating, note, currentProficiencyScore }
 */
export async function reviewMistake(id, { resolved = false, rating = "hint", note = "", currentProficiencyScore = 0.5 }) {
  // Fetch current mistake state
  const { data: mistake, error: fetchError } = await supabase
    .from("mistakes")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Run pure domain logic SM-2 interval calculations
  const sm2 = calculateSM2Review(mistake, rating, currentProficiencyScore);

  // Invoke atomic RPC transaction
  const { error: rpcError } = await supabase.rpc("review_mistake", {
    p_mistake_id: id,
    p_resolved: resolved,
    p_rating: rating,
    p_note: note,
    p_easiness_factor: sm2.easinessFactor,
    p_review_count: sm2.reviewCount,
    p_next_review_at: sm2.nextReviewAt.toISOString(),
    p_score_delta: sm2.scoreDelta
  });

  if (rpcError) throw rpcError;

  return {
    nextReviewAt: sm2.nextReviewAt,
    scoreDelta: sm2.scoreDelta
  };
}
