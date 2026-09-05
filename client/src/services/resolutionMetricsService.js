/**
 * Computes resolution rate metrics from the mistakes array.
 *
 * Returns:
 *   total, resolved, unresolved, resolutionRate (%)
 *   avgTimeToResolve (days)
 *   categoryResolution: { [category]: { total, resolved, rate } }
 *   topicResolution: { [topic]: { total, resolved, rate } }
 *   chartData: array for recharts bar chart
 */
export function calculateResolutionMetrics(mistakes) {
  if (!mistakes || mistakes.length === 0) {
    return {
      total: 0,
      resolved: 0,
      unresolved: 0,
      resolutionRate: 0,
      avgTimeToResolve: 0,
      categoryResolution: {},
      topicResolution: {},
      chartData: []
    };
  }

  const total = mistakes.length;
  const resolved = mistakes.filter((m) => m.status === "resolved").length;
  const unresolved = total - resolved;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Average time to resolve (days)
  const resolvedMistakes = mistakes.filter(
    (m) => m.status === "resolved" && (m.resolvedAt || m.resolved_at)
  );

  let avgTimeToResolve = 0;
  if (resolvedMistakes.length > 0) {
    const totalDays = resolvedMistakes.reduce((sum, m) => {
      const created = new Date(m.createdAt || m.created_at);
      const resolvedDate = new Date(m.resolvedAt || m.resolved_at);
      return sum + Math.max(0, Math.floor((resolvedDate - created) / (1000 * 60 * 60 * 24)));
    }, 0);
    avgTimeToResolve = Math.round(totalDays / resolvedMistakes.length);
  }

  // Category-wise resolution
  const categoryResolution = {};
  mistakes.forEach((m) => {
    const cat = m.mistakeType || m.mistake_type || "unknown";
    if (!categoryResolution[cat]) {
      categoryResolution[cat] = { total: 0, resolved: 0, rate: 0 };
    }
    categoryResolution[cat].total++;
    if (m.status === "resolved") categoryResolution[cat].resolved++;
  });
  Object.keys(categoryResolution).forEach((cat) => {
    const s = categoryResolution[cat];
    s.rate = s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;
  });

  // Topic-wise resolution
  const topicResolution = {};
  mistakes.forEach((m) => {
    const topic = m.topic || "unknown";
    if (!topicResolution[topic]) {
      topicResolution[topic] = { total: 0, resolved: 0, rate: 0 };
    }
    topicResolution[topic].total++;
    if (m.status === "resolved") topicResolution[topic].resolved++;
  });
  Object.keys(topicResolution).forEach((topic) => {
    const s = topicResolution[topic];
    s.rate = s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;
  });

  // Chart data: topic-level resolved vs unresolved (sorted by total desc)
  const chartData = Object.entries(topicResolution)
    .map(([topic, s]) => ({
      topic: topic.length > 12 ? topic.slice(0, 10) + "…" : topic,
      Resolved: s.resolved,
      Unresolved: s.unresolved || s.total - s.resolved
    }))
    .sort((a, b) => (b.Resolved + b.Unresolved) - (a.Resolved + a.Unresolved))
    .slice(0, 8);

  return {
    total,
    resolved,
    unresolved,
    resolutionRate,
    avgTimeToResolve,
    categoryResolution,
    topicResolution,
    chartData
  };
}
