/**
 * Adaptive Revision Scoring Engine
 *
 * Calculates a 0–100 priority score for each unresolved mistake using:
 *   Factor 1 – Mistake Severity    (0–35 pts): higher severity = higher priority
 *   Factor 2 – Attempt History     (0–25 pts): more failed attempts = higher priority
 *   Factor 3 – Problem Difficulty  (0–20 pts): Easy=5, Medium=15, Hard=20
 *   Factor 4 – Revision Recency    (0–20 pts): older = higher priority (maxes at 7+ days)
 */

/**
 * Computes the adaptive revision score for a single mistake.
 * @param {object} mistake - Mistake record
 * @param {number} previousAttempts - Number of completed revision attempts
 * @param {number} daysSinceLastRevision - Days since last revision was completed
 * @returns {number} 0–100 score
 */
export function calculateRevisionScore(mistake, previousAttempts = 0, daysSinceLastRevision = 0) {
  let score = 0;

  // Factor 1: Severity (0–35 pts)
  const severity = Number(mistake.severity || 3);
  score += (severity / 5) * 35;

  // Factor 2: Attempt history (0–25 pts)
  score += Math.min(previousAttempts * 5, 25);

  // Factor 3: Problem difficulty (0–20 pts)
  const difficultyMap = { Easy: 5, Medium: 15, Hard: 20 };
  score += difficultyMap[mistake.difficulty] || 10;

  // Factor 4: Revision recency (0–20 pts) — maxes at 7+ days idle
  score += Math.min((daysSinceLastRevision / 7) * 20, 20);

  return Math.min(Math.round(score), 100);
}

/**
 * Generates a personalized revision queue sorted by adaptive priority score (high → low).
 * @param {Array} mistakes - All mistake records
 * @param {Array} revisions - All revision session records
 * @param {Array} questionBank - The curated question bank array
 * @returns {Array} Sorted queue items with score, reason, and suggested practice question
 */
export function generateAdaptiveRevisionQueue(mistakes, revisions, questionBank) {
  const now = new Date();

  const queueItems = mistakes
    .filter((m) => m.status !== "resolved")
    .map((mistake) => {
      const mistakeId = mistake.id || mistake._id;

      // Count completed revision sessions linked to this mistake
      const previousAttempts = revisions.filter(
        (r) =>
          (r.mistake_id === mistakeId || r.mistakeId === mistakeId) &&
          r.status === "completed"
      ).length;

      // Find the most recent completed revision for this mistake
      const lastRevision = revisions
        .filter(
          (r) =>
            (r.mistake_id === mistakeId || r.mistakeId === mistakeId) &&
            r.status === "completed"
        )
        .sort(
          (a, b) =>
            new Date(b.completedAt || b.completed_at) -
            new Date(a.completedAt || a.completed_at)
        )[0];

      const daysSinceRevision = lastRevision
        ? Math.floor(
            (now - new Date(lastRevision.completedAt || lastRevision.completed_at)) /
              (1000 * 60 * 60 * 24)
          )
        : Math.floor(
            (now - new Date(mistake.createdAt || mistake.created_at)) /
              (1000 * 60 * 60 * 24)
          );

      const adaptiveScore = calculateRevisionScore(mistake, previousAttempts, daysSinceRevision);

      // Find a matching practice question (same topic + pattern, or same topic)
      const suggestedQuestion =
        questionBank.find(
          (q) => q.topic === mistake.topic && q.pattern === mistake.pattern
        ) || questionBank.find((q) => q.topic === mistake.topic);

      return {
        mistakeId,
        problemTitle: mistake.problemTitle || mistake.problem_title || "Untitled",
        topic: mistake.topic,
        pattern: mistake.pattern,
        severity: Number(mistake.severity || 3),
        adaptiveScore,
        previousAttempts,
        daysSinceRevision,
        reason: [
          `Severity ${Number(mistake.severity || 3)}/5`,
          `${previousAttempts} prior attempt${previousAttempts !== 1 ? "s" : ""}`,
          `${daysSinceRevision}d idle`
        ].join(" · "),
        suggestedQuestion
      };
    })
    .sort((a, b) => b.adaptiveScore - a.adaptiveScore);

  return queueItems;
}

/**
 * Returns a color token name based on score value.
 * @param {number} score
 * @returns {"danger"|"warn"|"good"}
 */
export function scoreToTone(score) {
  if (score >= 70) return "danger";
  if (score >= 40) return "warn";
  return "good";
}
