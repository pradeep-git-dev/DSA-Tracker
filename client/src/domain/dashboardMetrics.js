export const coreTopics = [
  "Array",
  "String",
  "Hash Table",
  "Two Pointers",
  "Binary Search",
  "Sliding Window",
  "Stack",
  "Queue",
  "Linked List",
  "Tree",
  "Graph",
  "Heap (Priority Queue)",
  "Dynamic Programming",
  "Backtracking",
  "Greedy",
  "Trie",
  "Bit Manipulation",
  "Union Find",
  "Intervals"
];

export function compileDashboardData({ user, snapshot, mistakes, sessions, patterns, snapshots }) {
  const openMistakes = mistakes.filter((mistake) => mistake.status !== "resolved");
  const dueNow = new Date();
  
  const dueRevisions = sessions.filter(
    (session) => session.status === "scheduled" && new Date(session.scheduled_for || session.scheduledFor) <= dueNow
  );

  const mistakeByTopic = groupCount(openMistakes, "topic");
  const topicInsights = mergeTopicStrength(
    snapshot?.topic_insights || snapshot?.topicInsights || [], 
    mistakeByTopic, 
    patterns
  );

  const covered = new Set();
  const recentQuestions = snapshot?.recent_questions || snapshot?.recentQuestions;
  if (recentQuestions) {
    for (const q of recentQuestions) {
      for (const tag of q.topicTags || q.topic_tags || []) {
        covered.add(tag.name);
      }
    }
  }

  topicInsights
    .filter((topic) => topic.solved > 0 || topic.confidence > 0)
    .forEach((topic) => {
      covered.add(topic.topic);
    });

  const uncoveredTopics = coreTopics.filter((topic) => !covered.has(topic));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      leetcodeUsername: user.leetcodeUsername || "",
      theme: user.theme
    },
    leetcode: snapshot,
    metrics: {
      solved: (snapshot?.counts || snapshot)?.solved || { all: 0, easy: 0, medium: 0, hard: 0 },
      submissions: (snapshot?.counts || snapshot)?.submissions || { all: 0, easy: 0, medium: 0, hard: 0 },
      activeDays: snapshot?.calendar?.totalActiveDays || snapshot?.calendar?.total_active_days || 0,
      streak: snapshot?.calendar?.streak || 0,
      openMistakes: openMistakes.length,
      dueRevisions: dueRevisions.length,
      completedPatterns: patterns.filter((pattern) => pattern.status === "complete").length
    },
    attemptStats: snapshot?.attempt_stats || snapshot?.attemptStats || {
      totalRecent: 0,
      acceptedRecent: 0,
      failedRecent: 0,
      recentAcceptanceRate: 0,
      statusCounts: {},
      languageCounts: {},
      problemAttempts: [],
      topicAttempts: []
    },
    learningCurve: buildLearningCurve(snapshots, snapshot, mistakes),
    topicInsights,
    uncoveredTopics,
    mistakes,
    revisions: sessions,
    patterns
  };
}

function groupCount(items, key) {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
    return counts;
  }, {});
}

function mergeTopicStrength(topicInsights, mistakeByTopic, patterns) {
  const map = new Map();

  for (const insight of topicInsights) {
    map.set(insight.topic, {
      ...insight,
      mistakes: mistakeByTopic[insight.topic] || 0,
      confidence: 0
    });
  }

  for (const pattern of patterns) {
    const current = map.get(pattern.topic) || {
      topic: pattern.topic,
      solved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      failedRecent: 0,
      mistakes: mistakeByTopic[pattern.topic] || 0,
      strength: 20,
      confidence: 0
    };
    current.confidence = Math.max(current.confidence, pattern.confidence);
    current.strength = Math.max(current.strength, Math.round(pattern.confidence * 0.9));
    map.set(pattern.topic, current);
  }

  for (const [topic, count] of Object.entries(mistakeByTopic)) {
    const current = map.get(topic) || {
      topic,
      solved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      failedRecent: 0,
      confidence: 0,
      strength: 35
    };
    current.mistakes = count;
    current.strength = Math.max(5, Math.min(100, current.strength - count * 9));
    map.set(topic, current);
  }

  return [...map.values()].sort((a, b) => a.strength - b.strength);
}

function buildLearningCurve(snapshots, latest, mistakes = []) {
  if (snapshots && snapshots.length > 1) {
    // Sort chronologically ascending
    const sortedSnaps = [...snapshots].sort(
      (a, b) => new Date(a.synced_at || a.createdAt).getTime() - new Date(b.synced_at || b.createdAt).getTime()
    );
    return sortedSnaps.map((snapshot) => {
      const snapDate = new Date(snapshot.synced_at || snapshot.created_at || snapshot.createdAt);
      const activeMistakes = mistakes.filter((m) => {
        const createdDate = new Date(m.created_at || m.createdAt);
        const updatedDate = new Date(m.updated_at || m.updatedAt);
        return createdDate <= snapDate && (m.status !== "resolved" || updatedDate > snapDate);
      }).length;

      const solved = snapshot.counts?.solved?.all || snapshot.counts?.solvedAll || 0;
      const medium = snapshot.counts?.solved?.medium || snapshot.counts?.solvedMedium || 0;
      const hard = snapshot.counts?.solved?.hard || snapshot.counts?.solvedHard || 0;

      return {
        date: snapDate.toISOString().slice(0, 10),
        solved,
        medium,
        hard,
        mistakes: activeMistakes
      };
    });
  }

  // Fallback to weekly calendar interval
  const submissionsByDay = latest?.calendar?.submissionsByDay || latest?.calendar?.submissions_by_day || {};
  const today = new Date();
  const weeks = Array.from({ length: 12 }, (_, index) => ({
    date: `W-${11 - index}`,
    solved: 0,
    medium: 0,
    hard: 0,
    mistakes: 0
  }));

  Object.entries(submissionsByDay).forEach(([stamp, count]) => {
    const date = new Date(Number(stamp) * 1000);
    const diffDays = Math.floor((startOfDay(today) - startOfDay(date)) / 86400000);
    if (diffDays < 0 || diffDays >= 84) return;
    const week = 11 - Math.floor(diffDays / 7);
    weeks[week].solved += Math.min(Number(count), 8);
  });

  // Build a cumulative curve for the weekly fallback
  const solvedAccumulator = latest?.counts?.solved?.all || latest?.solved || 0;
  const totalSolvedInWeeks = weeks.reduce((sum, w) => sum + w.solved, 0);
  let currentSolved = Math.max(0, solvedAccumulator - totalSolvedInWeeks);

  for (let i = 0; i < 12; i++) {
    currentSolved += weeks[i].solved;
    weeks[i].solved = currentSolved;
  }

  // Distribute active mistakes into weeks
  for (let i = 0; i < 12; i++) {
    const limitDate = new Date();
    limitDate.setDate(today.getDate() - (11 - i) * 7);
    weeks[i].mistakes = mistakes.filter((m) => {
      const createdDate = new Date(m.created_at || m.createdAt);
      const updatedDate = new Date(m.updated_at || m.updatedAt);
      return createdDate <= limitDate && (m.status !== "resolved" || updatedDate > limitDate);
    }).length;
  }

  return weeks;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
