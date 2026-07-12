/**
 * Spaced repetition domain scheduler implementing the SM-2 algorithm,
 * adapted with a severity pull and topic proficiency multiplier.
 */

/**
 * Calculates the next review date for a newly logged mistake based on severity.
 * @param {number} severity - Mistake severity (1-5)
 * @returns {Date}
 */
export function getInitialReviewDate(severity) {
  const days = Math.max(1, 6 - severity);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Calculates SM-2 parameters for a mistake review.
 * @param {object} mistake - The mistake object containing current review metrics
 * @param {string} rating - The review quality rating ('failed', 'hint', 'easy')
 * @param {number} currentProficiencyScore - The user's current proficiency score for the topic (0.0 to 1.0, default 0.5)
 * @returns {object} { easinessFactor, reviewCount, nextReviewAt, scoreDelta }
 */
export function calculateSM2Review(mistake, rating, currentProficiencyScore = 0.5) {
  const q = { failed: 1, hint: 3, easy: 5 }[rating] || 3;

  // 1. Calculate topic proficiency score delta
  let scoreDelta = 0;
  if (q === 5) {
    scoreDelta = 0.05;
  } else if (q === 1) {
    scoreDelta = -0.10;
  }

  const postProficiencyScore = Math.max(0.0, Math.min(1.0, currentProficiencyScore + scoreDelta));

  // 2. Adjust SM-2 Easiness Factor (EF)
  const newEF = mistake.easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const nextEF = Math.max(1.3, newEF);

  // 3. Determine next review count
  let nextReviewCount = 0;
  if (q < 3) {
    nextReviewCount = 1;
  } else {
    nextReviewCount = (mistake.reviewCount || 0) + 1;
  }

  // 4. Calculate interval using proficiency multiplier and severity pull
  const priorityMultiplier = 0.5 + 0.5 * postProficiencyScore;

  let baseInterval = 1;
  if (nextReviewCount === 2) {
    baseInterval = 6;
  } else if (nextReviewCount > 2) {
    baseInterval = Math.round((nextReviewCount - 1) * nextEF);
  }

  const severityPull = Math.max(0, 5 - (mistake.severity || 3));
  const adaptedInterval = Math.max(1, Math.round((baseInterval - severityPull) * priorityMultiplier));

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + adaptedInterval);

  return {
    easinessFactor: nextEF,
    reviewCount: nextReviewCount,
    nextReviewAt,
    scoreDelta
  };
}
