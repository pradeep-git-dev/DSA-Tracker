/**
 * Computes mistake category recurrence analytics from the mistakes array.
 * Returns a map of category => { count, resolved, recurrenceRate, resolutionRate, affectedTopics }
 * @param {Array} mistakes - Array of mistake objects
 */
export function calculateMistakePatternAnalytics(mistakes) {
  if (!mistakes || mistakes.length === 0) return {};

  const categoryStats = {};

  mistakes.forEach((mistake) => {
    const category = mistake.mistakeType || mistake.mistake_type || "unknown";
    const status = mistake.status;
    const topic = mistake.topic;

    if (!categoryStats[category]) {
      categoryStats[category] = {
        count: 0,
        resolved: 0,
        recurrenceRate: 0,
        resolutionRate: 0,
        affectedTopics: new Set()
      };
    }

    categoryStats[category].count += 1;
    if (status === "resolved") categoryStats[category].resolved += 1;
    if (topic) categoryStats[category].affectedTopics.add(topic);
  });

  const total = mistakes.length;

  Object.keys(categoryStats).forEach((cat) => {
    const stats = categoryStats[cat];
    stats.recurrenceRate = total > 0 ? Math.round((stats.count / total) * 100) : 0;
    stats.resolutionRate = stats.count > 0 ? Math.round((stats.resolved / stats.count) * 100) : 0;
    stats.affectedTopics = Array.from(stats.affectedTopics);
  });

  return categoryStats;
}

/**
 * Builds an 8-week mistake logging trend (logged vs resolved per week).
 * @param {Array} mistakes - Array of mistake objects
 */
export function buildWeeklyMistakeTrend(mistakes) {
  const weeks = Array.from({ length: 8 }, (_, i) => ({
    week: `W-${7 - i}`,
    logged: 0,
    resolved: 0
  }));

  const now = new Date();

  mistakes.forEach((m) => {
    const created = new Date(m.created_at || m.createdAt);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays >= 56) return;

    const weekIdx = 7 - Math.floor(diffDays / 7);
    if (weekIdx >= 0 && weekIdx < 8) {
      weeks[weekIdx].logged += 1;
      if (m.status === "resolved") weeks[weekIdx].resolved += 1;
    }
  });

  return weeks;
}

/**
 * Returns a human-readable label for a mistake category code.
 * @param {string} category
 */
export function formatCategoryLabel(category) {
  const labels = {
    concept: "Concept Gap",
    "edge-case": "Edge Case",
    implementation: "Implementation",
    complexity: "Complexity",
    "pattern-choice": "Pattern Choice",
    "dry-run": "Dry Run"
  };
  return labels[category] || category;
}
