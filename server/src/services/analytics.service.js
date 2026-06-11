import { LeetcodeSnapshot } from "../models/LeetcodeSnapshot.js";
import { Mistake } from "../models/Mistake.js";
import { PatternProgress } from "../models/PatternProgress.js";
import { RevisionSession } from "../models/RevisionSession.js";
import { buildRecommendations } from "./recommendation.service.js";

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

export async function buildDashboard(user) {
  const [snapshot, mistakes, sessions, patterns, snapshots] = await Promise.all([
    LeetcodeSnapshot.findOne({ user: user._id }).sort({ createdAt: -1 }),
    Mistake.find({ user: user._id }).sort({ createdAt: -1 }).limit(100),
    RevisionSession.find({ user: user._id }).sort({ scheduledFor: 1 }),
    PatternProgress.find({ user: user._id }).sort({ confidence: 1 }),
    LeetcodeSnapshot.find({ user: user._id }).sort({ createdAt: 1 }).limit(24)
  ]);

  const openMistakes = mistakes.filter((mistake) => mistake.status !== "resolved");
  const dueNow = new Date();
  const dueRevisions = sessions.filter(
    (session) => session.status === "scheduled" && new Date(session.scheduledFor) <= dueNow
  );

  const mistakeByTopic = groupCount(openMistakes, "topic");
  const topicInsights = mergeTopicStrength(snapshot?.topicInsights || [], mistakeByTopic, patterns);
  const covered = new Set();
  if (snapshot?.recentQuestions) {
    for (const q of snapshot.recentQuestions) {
      for (const tag of q.topicTags || []) {
        covered.add(tag.name);
      }
    }
  }
  topicInsights.filter((topic) => topic.solved > 0 || topic.confidence > 0).forEach((topic) => {
    covered.add(topic.topic);
  });
  const uncoveredTopics = coreTopics.filter((topic) => !covered.has(topic));
  const recommendations = buildRecommendations({
    snapshot,
    mistakes: openMistakes,
    patterns,
    topicInsights,
    sessions
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      leetcodeUsername: user.leetcodeUsername || "",
      theme: user.theme
    },
    leetcode: snapshot,
    metrics: {
      solved: snapshot?.counts?.solved || { all: 0, easy: 0, medium: 0, hard: 0 },
      submissions: snapshot?.counts?.submissions || { all: 0, easy: 0, medium: 0, hard: 0 },
      activeDays: snapshot?.calendar?.totalActiveDays || 0,
      streak: snapshot?.calendar?.streak || 0,
      openMistakes: openMistakes.length,
      dueRevisions: dueRevisions.length,
      completedPatterns: patterns.filter((pattern) => pattern.status === "complete").length
    },
    attemptStats: snapshot?.attemptStats || {
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
    patterns,
    recommendations
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
  if (snapshots.length > 1) {
    return snapshots.map((snapshot) => {
      const snapDate = new Date(snapshot.createdAt);
      const activeMistakes = mistakes.filter((m) => {
        const createdDate = new Date(m.createdAt);
        return createdDate <= snapDate && (m.status !== "resolved" || new Date(m.updatedAt) > snapDate);
      }).length;

      return {
        date: snapshot.createdAt.toISOString().slice(0, 10),
        solved: snapshot.counts?.solved?.all || 0,
        medium: snapshot.counts?.solved?.medium || 0,
        hard: snapshot.counts?.solved?.hard || 0,
        mistakes: activeMistakes
      };
    });
  }

  const submissionsByDay = latest?.calendar?.submissionsByDay || {};
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
  let solvedAccumulator = latest?.counts?.solved?.all || 0;
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
      const createdDate = new Date(m.createdAt);
      return createdDate <= limitDate && (m.status !== "resolved" || new Date(m.updatedAt) > limitDate);
    }).length;
  }

  return weeks;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
