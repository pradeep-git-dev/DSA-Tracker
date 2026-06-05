const questionBank = [
  ["two-sum", "Two Sum", "Array", "Easy", "Hashing", ["strivers", "neetcode", "gfg160"]],
  ["contains-duplicate", "Contains Duplicate", "Array", "Easy", "Hashing", ["strivers", "neetcode"]],
  ["valid-anagram", "Valid Anagram", "Array", "Easy", "Hashing", ["strivers", "neetcode"]],
  ["group-anagrams", "Group Anagrams", "Array", "Medium", "Hashing", ["neetcode"]],
  ["top-k-frequent-elements", "Top K Frequent Elements", "Array", "Medium", "Heap", ["neetcode"]],
  ["product-of-array-except-self", "Product of Array Except Self", "Array", "Medium", "Prefix product", ["strivers", "gfg160", "neetcode"]],
  ["longest-consecutive-sequence", "Longest Consecutive Sequence", "Array", "Medium", "Hashing", ["strivers", "neetcode", "gfg160"]],
  ["maximum-subarray", "Maximum Subarray", "Array", "Medium", "Greedy", ["strivers", "gfg160"]],
  ["best-time-to-buy-and-sell-stock", "Best Time to Buy and Sell Stock", "Array", "Easy", "Greedy", ["strivers", "neetcode", "gfg160"]],
  ["majority-element", "Majority Element", "Array", "Easy", "Voting", ["strivers", "gfg160"]],
  ["move-zeroes", "Move Zeroes", "Array", "Easy", "Two pointers", ["strivers"]],
  ["valid-palindrome", "Valid Palindrome", "Two Pointers", "Easy", "Two pointers", ["strivers", "neetcode"]],
  ["two-sum-ii-input-array-is-sorted", "Two Sum II - Input Array Is Sorted", "Two Pointers", "Medium", "Two pointers", ["neetcode"]],
  ["3sum", "3Sum", "Two Pointers", "Medium", "Two pointers", ["strivers", "neetcode", "gfg160"]],
  ["container-with-most-water", "Container With Most Water", "Two Pointers", "Medium", "Two pointers", ["strivers", "neetcode", "gfg160"]],
  ["trapping-rain-water", "Trapping Rain Water", "Two Pointers", "Hard", "Two pointers", ["strivers", "neetcode"]],
  ["longest-substring-without-repeating-characters", "Longest Substring Without Repeating Characters", "Sliding Window", "Medium", "Variable window", ["strivers", "neetcode"]],
  ["longest-repeating-character-replacement", "Longest Repeating Character Replacement", "Sliding Window", "Medium", "Variable window", ["neetcode"]],
  ["minimum-window-substring", "Minimum Window Substring", "Sliding Window", "Hard", "Variable window", ["neetcode"]],
  ["binary-search", "Binary Search", "Binary Search", "Easy", "Binary Search", ["strivers", "neetcode"]],
  ["search-a-2d-matrix", "Search a 2D Matrix", "Binary Search", "Medium", "Binary Search", ["strivers", "neetcode"]],
  ["koko-eating-bananas", "Koko Eating Bananas", "Binary Search", "Medium", "Search space", ["neetcode"]],
  ["find-minimum-in-rotated-sorted-array", "Find Minimum in Rotated Sorted Array", "Binary Search", "Medium", "Boundary search", ["neetcode"]],
  ["search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Binary Search", "Medium", "Modified binary search", ["strivers", "neetcode"]],
  ["valid-parentheses", "Valid Parentheses", "Stack", "Easy", "Stack", ["strivers", "neetcode", "gfg160"]],
  ["min-stack", "Min Stack", "Stack", "Medium", "Stack", ["neetcode"]],
  ["daily-temperatures", "Daily Temperatures", "Stack", "Medium", "Monotonic stack", ["neetcode"]],
  ["largest-rectangle-in-histogram", "Largest Rectangle in Histogram", "Stack", "Hard", "Monotonic stack", ["strivers", "neetcode"]],
  ["reverse-linked-list", "Reverse Linked List", "Linked List", "Easy", "Pointer reversal", ["strivers", "neetcode", "gfg160"]],
  ["merge-two-sorted-lists", "Merge Two Sorted Lists", "Linked List", "Easy", "Two pointers", ["strivers", "gfg160", "neetcode"]],
  ["remove-nth-node-from-end-of-list", "Remove Nth Node From End of List", "Linked List", "Medium", "Two pointers", ["strivers", "neetcode"]],
  ["linked-list-cycle", "Linked List Cycle", "Linked List", "Easy", "Fast/slow pointers", ["strivers", "neetcode"]],
  ["lru-cache", "LRU Cache", "Linked List", "Medium", "Design", ["strivers", "neetcode"]],
  ["merge-k-sorted-lists", "Merge K Sorted Lists", "Linked List", "Hard", "Divide and conquer", ["strivers", "neetcode"]],
  ["invert-binary-tree", "Invert Binary Tree", "Tree", "Easy", "DFS", ["neetcode"]],
  ["maximum-depth-of-binary-tree", "Maximum Depth of Binary Tree", "Tree", "Easy", "DFS", ["strivers", "neetcode"]],
  ["diameter-of-binary-tree", "Diameter of Binary Tree", "Tree", "Easy", "DFS", ["neetcode"]],
  ["balanced-binary-tree", "Balanced Binary Tree", "Tree", "Easy", "DFS", ["strivers", "neetcode"]],
  ["same-tree", "Same Tree", "Tree", "Easy", "DFS", ["strivers", "neetcode"]],
  ["lowest-common-ancestor-of-a-binary-search-tree", "Lowest Common Ancestor of a Binary Search Tree", "Tree", "Easy", "DFS", ["strivers", "neetcode"]],
  ["binary-tree-level-order-traversal", "Binary Tree Level Order Traversal", "Tree", "Medium", "BFS", ["strivers", "neetcode"]],
  ["validate-binary-search-tree", "Validate Binary Search Tree", "Tree", "Medium", "DFS", ["strivers", "neetcode"]],
  ["kth-smallest-element-in-a-bst", "Kth Smallest Element in a BST", "Tree", "Medium", "DFS", ["strivers", "neetcode"]],
  ["kth-largest-element-in-an-array", "Kth Largest Element in an Array", "Heap (Priority Queue)", "Medium", "Heap", ["strivers", "neetcode"]],
  ["task-scheduler", "Task Scheduler", "Heap (Priority Queue)", "Medium", "Heap", ["neetcode"]],
  ["find-median-from-data-stream", "Find Median from Data Stream", "Heap (Priority Queue)", "Hard", "Heap", ["strivers", "neetcode"]],
  ["subsets", "Subsets", "Backtracking", "Medium", "Backtracking", ["gfg160", "neetcode"]],
  ["combination-sum", "Combination Sum", "Backtracking", "Medium", "Backtracking", ["strivers", "gfg160", "neetcode"]],
  ["permutations", "Permutations", "Backtracking", "Medium", "Backtracking", ["strivers", "neetcode"]],
  ["word-search", "Word Search", "Backtracking", "Medium", "Backtracking", ["strivers", "neetcode"]],
  ["n-queens", "N-Queens", "Backtracking", "Hard", "Backtracking", ["strivers", "neetcode"]],
  ["number-of-islands", "Number of Islands", "Graph", "Medium", "DFS/BFS", ["strivers", "neetcode", "gfg160"]],
  ["clone-graph", "Clone Graph", "Graph", "Medium", "Graph traversal", ["neetcode"]],
  ["course-schedule", "Course Schedule", "Graph", "Medium", "Topological sort", ["gfg160", "neetcode", "strivers"]],
  ["network-delay-time", "Network Delay Time", "Graph", "Medium", "Dijkstra", ["neetcode"]],
  ["climbing-stairs", "Climbing Stairs", "Dynamic Programming", "Easy", "1D DP", ["strivers", "neetcode"]],
  ["house-robber", "House Robber", "Dynamic Programming", "Medium", "1D DP", ["strivers", "neetcode"]],
  ["longest-palindromic-substring", "Longest Palindromic Substring", "Dynamic Programming", "Medium", "String DP", ["strivers", "neetcode"]],
  ["coin-change", "Coin Change", "Dynamic Programming", "Medium", "1D DP", ["strivers", "neetcode"]],
  ["word-break", "Word Break", "Dynamic Programming", "Medium", "String DP", ["neetcode"]],
  ["longest-increasing-subsequence", "Longest Increasing Subsequence", "Dynamic Programming", "Medium", "DP with binary search", ["strivers", "neetcode"]],
  ["partition-equal-subset-sum", "Partition Equal Subset Sum", "Dynamic Programming", "Medium", "Knapsack", ["strivers", "neetcode"]],
  ["longest-common-subsequence", "Longest Common Subsequence", "Dynamic Programming", "Medium", "Matrix DP", ["strivers", "neetcode"]],
  ["implement-trie-prefix-tree", "Implement Trie (Prefix Tree)", "Trie", "Medium", "Trie", ["neetcode"]],
  ["number-of-1-bits", "Number of 1 Bits", "Bit Manipulation", "Easy", "Bit tricks", ["neetcode"]],
  ["accounts-merge", "Accounts Merge", "Union Find", "Medium", "Union Find", ["neetcode"]]
].map(([slug, title, topic, difficulty, pattern, sheets = []]) => ({ slug, title, topic, difficulty, pattern, sheets }));

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
  const failedProblems = new Map((snapshot?.attemptStats?.problemAttempts || []).map((item) => [item.titleSlug, item.failed]));
  const failedTopics = new Map((snapshot?.attemptStats?.topicAttempts || []).map((item) => [item.topic, item.failed]));
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
      const leetcodeFailureBoost = (failedProblems.get(question.slug) || 0) * 18 + (failedTopics.get(question.topic) || 0) * 5;

      return {
        ...question,
        score: Math.round(topicScore + difficultyBoost + patternPenalty + scheduledPenalty + leetcodeFailureBoost),
        reason: explainRecommendation(question.topic, topicScore, leetcodeFailureBoost)
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

function explainRecommendation(topic, score, leetcodeFailureBoost) {
  if (leetcodeFailureBoost > 0) return `${topic} has recent LeetCode failed-attempt pressure.`;
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
