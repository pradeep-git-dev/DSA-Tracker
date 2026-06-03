const questionBank = [
  ["two-sum", "Two Sum", "Array", "Easy", "Hashing"],
  ["contains-duplicate", "Contains Duplicate", "Array", "Easy", "Hashing"],
  ["product-of-array-except-self", "Product of Array Except Self", "Array", "Medium", "Prefix product"],
  ["longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "Sliding Window", "Medium", "Variable window"],
  ["minimum-window-substring", "Minimum Window Substring", "Sliding Window", "Hard", "Variable window"],
  ["search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Binary Search", "Medium", "Modified binary search"],
  ["find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "Binary Search", "Medium", "Boundary search"],
  ["merge-intervals", "Merge Intervals", "Intervals", "Medium", "Sort and sweep"],
  ["insert-interval", "Insert Interval", "Intervals", "Medium", "Merge"],
  ["valid-parentheses", "Valid Parentheses", "Stack", "Easy", "Stack"],
  ["daily-temperatures", "Daily Temperatures", "Stack", "Medium", "Monotonic stack"],
  ["largest-rectangle-in-histogram", "Largest Rectangle in Histogram", "Stack", "Hard", "Monotonic stack"],
  ["reverse-linked-list", "Reverse Linked List", "Linked List", "Easy", "Pointer reversal"],
  ["merge-two-sorted-lists", "Merge Two Sorted Lists", "Linked List", "Easy", "Two pointers"],
  ["binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "Tree", "Medium", "BFS"],
  ["lowest-common-ancestor-of-a-binary-tree", "Lowest Common Ancestor of a Binary Tree", "Tree", "Medium", "DFS"],
  ["number-of-islands", "Number of Islands", "Graph", "Medium", "DFS/BFS"],
  ["clone-graph", "Clone Graph", "Graph", "Medium", "Graph traversal"],
  ["course-schedule", "Course Schedule", "Graph", "Medium", "Topological sort"],
  ["network-delay-time", "Network Delay Time", "Graph", "Medium", "Dijkstra"],
  ["coin-change", "Coin Change", "Dynamic Programming", "Medium", "1D DP"],
  ["longest-increasing-subsequence", "Longest Increasing Subsequence", "Dynamic Programming", "Medium", "DP with binary search"],
  ["word-break", "Word Break", "Dynamic Programming", "Medium", "String DP"],
  ["partition-equal-subset-sum", "Partition Equal Subset Sum", "Dynamic Programming", "Medium", "Knapsack"],
  ["combination-sum", "Combination Sum", "Backtracking", "Medium", "Backtracking"],
  ["subsets", "Subsets", "Backtracking", "Medium", "Backtracking"],
  ["jump-game", "Jump Game", "Greedy", "Medium", "Greedy reachability"],
  ["task-scheduler", "Task Scheduler", "Heap (Priority Queue)", "Medium", "Heap"],
  ["implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", "Trie", "Medium", "Trie"],
  ["number-of-1-bits", "Number of 1 Bits", "Bit Manipulation", "Easy", "Bit tricks"],
  ["accounts-merge", "Accounts Merge", "Union Find", "Medium", "Union Find"]
].map(([slug, title, topic, difficulty, pattern]) => ({ slug, title, topic, difficulty, pattern }));

export function buildRecommendations({ snapshot, mistakes, patterns, topicInsights, sessions }) {
  const topicNeed = new Map();

  for (const topic of topicInsights) {
    topicNeed.set(topic.topic, Math.max(topicNeed.get(topic.topic) || 0, 100 - (topic.strength || 0)));
  }

  for (const mistake of mistakes) {
    const ageDays = Math.max(1, (Date.now() - new Date(mistake.createdAt).getTime()) / 86400000);
    const reviewPressure = Math.min(30, ageDays * 1.5) + mistake.severity * 8 + Math.max(0, 4 - mistake.reviewCount) * 6;
    topicNeed.set(mistake.topic, (topicNeed.get(mistake.topic) || 20) + reviewPressure);
  }

  for (const pattern of patterns) {
    const score = 100 - pattern.confidence + (pattern.status === "complete" ? -40 : 15);
    topicNeed.set(pattern.topic, Math.max(topicNeed.get(pattern.topic) || 0, score));
  }

  const recentSolved = new Set((snapshot?.recentAccepted || []).map((item) => item.titleSlug));
  const scheduledTopics = new Set(
    sessions.filter((session) => session.status === "scheduled").map((session) => session.focusTopic)
  );

  const questions = questionBank
    .filter((question) => !recentSolved.has(question.slug))
    .map((question) => {
      const topicScore = topicNeed.get(question.topic) || 18;
      const patternPenalty = patterns.find((pattern) => pattern.pattern === question.pattern)?.status === "complete" ? -18 : 0;
      const difficultyBoost = question.difficulty === "Hard" ? 8 : question.difficulty === "Medium" ? 16 : 4;
      const scheduledPenalty = scheduledTopics.has(question.topic) ? -8 : 0;

      return {
        ...question,
        score: Math.round(topicScore + difficultyBoost + patternPenalty + scheduledPenalty),
        reason: explainRecommendation(question.topic, topicScore)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const weakTopics = [...topicNeed.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([topic, score]) => ({
      topic,
      score: Math.round(score),
      reason: score > 80 ? "High mistake pressure or low confidence" : "Needs practice reinforcement"
    }));

  return {
    questions,
    weakTopics,
    report: buildReport({ snapshot, mistakes, patterns, weakTopics, questions })
  };
}

export function generateRevisionBlueprint({ mistakes, topicInsights }) {
  const byTopic = mistakes.reduce((map, mistake) => {
    map[mistake.topic] = map[mistake.topic] || [];
    map[mistake.topic].push(mistake);
    return map;
  }, {});

  const queue = Object.entries(byTopic)
    .map(([topic, topicMistakes]) => ({
      topic,
      pattern: mostCommon(topicMistakes.map((mistake) => mistake.pattern)),
      mistakes: topicMistakes,
      priority: topicMistakes.reduce((sum, mistake) => sum + mistake.severity * 10 + Math.max(0, 4 - mistake.reviewCount) * 7, 0)
    }))
    .sort((a, b) => b.priority - a.priority);

  for (const insight of topicInsights.slice(0, 4)) {
    if (!queue.some((item) => item.topic === insight.topic) && insight.strength < 55) {
      queue.push({
        topic: insight.topic,
        pattern: "Mixed practice",
        mistakes: [],
        priority: 100 - insight.strength
      });
    }
  }

  return queue.slice(0, 6);
}

function mostCommon(values) {
  const counts = values.reduce((map, value) => {
    map[value] = (map[value] || 0) + 1;
    return map;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Mixed practice";
}

function explainRecommendation(topic, score) {
  if (score > 80) return `${topic} is currently a high-priority weak area.`;
  if (score > 45) return `${topic} needs reinforcement from recent app activity.`;
  return `${topic} keeps coverage balanced.`;
}

function buildReport({ snapshot, mistakes, patterns, weakTopics, questions }) {
  const solved = snapshot?.counts?.solved?.all || 0;
  const accuracy = snapshot?.counts?.submissions?.all
    ? Math.round((solved / snapshot.counts.submissions.all) * 100)
    : 0;
  const openMistakes = mistakes.length;
  const completePatterns = patterns.filter((pattern) => pattern.status === "complete").length;
  const topWeak = weakTopics.slice(0, 3).map((item) => item.topic).join(", ") || "not enough data yet";
  const nextQuestion = questions[0]?.title || "sync LeetCode and log mistakes to unlock suggestions";

  return {
    summary: `Solved ${solved} problems with ${accuracy}% accepted-to-submission ratio. ${openMistakes} active mistakes and ${completePatterns} completed patterns are shaping the plan.`,
    diagnosis: `The strongest signal says to focus on ${topWeak}. This combines LeetCode recency, failed attempt pressure, unresolved mistakes, and pattern confidence.`,
    nextAction: `Start with ${nextQuestion}, then revise the highest severity unresolved mistake before adding new volume.`
  };
}
