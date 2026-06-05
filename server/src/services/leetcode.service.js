import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const profileQuery = `
query dsaProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
      reputation
      aboutMe
      school
      websites
      countryName
      company
      skillTags
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
      totalSubmissionNum {
        difficulty
        count
        submissions
      }
    }
  }
  recentAcSubmissionList(username: $username, limit: 1000) {
    id
    title
    titleSlug
    timestamp
  }
  recentSubmissionList(username: $username, limit: 500) {
    id
    title
    titleSlug
    statusDisplay
    lang
    timestamp
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    topPercentage
  }
}`;

const calendarQuery = `
query dsaCalendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      activeYears
      streak
      totalActiveDays
      submissionCalendar
    }
  }
}`;

const questionQuery = `
query dsaQuestion($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    difficulty
    acRate
    topicTags {
      name
      slug
    }
  }
}`;

async function leetcodeGraphql(query, variables) {
  const response = await fetch(env.leetcodeGraphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "referer": "https://leetcode.com/",
      "user-agent": "DSA-Tracker/2.0"
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new ApiError(502, `LeetCode returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new ApiError(502, payload.errors.map((error) => error.message).join("; "));
  }

  return payload.data;
}

function parseCalendar(calendar) {
  try {
    return JSON.parse(calendar || "{}");
  } catch {
    return {};
  }
}

function normalizeCounts(stats) {
  const accepted = Object.fromEntries((stats?.acSubmissionNum || []).map((item) => [item.difficulty, item.count]));
  const submissions = Object.fromEntries(
    (stats?.totalSubmissionNum || []).map((item) => [item.difficulty, item.submissions])
  );

  return {
    solved: {
      all: accepted.All || 0,
      easy: accepted.Easy || 0,
      medium: accepted.Medium || 0,
      hard: accepted.Hard || 0
    },
    submissions: {
      all: submissions.All || 0,
      easy: submissions.Easy || 0,
      medium: submissions.Medium || 0,
      hard: submissions.Hard || 0
    }
  };
}

function buildTopicInsights(questions, recentSubmissions) {
  const failedBySlug = recentSubmissions.reduce((map, submission) => {
    if (submission.statusDisplay !== "Accepted") {
      map[submission.titleSlug] = (map[submission.titleSlug] || 0) + 1;
    }
    return map;
  }, {});

  const topics = new Map();
  for (const question of questions) {
    for (const tag of question.topicTags || []) {
      const current = topics.get(tag.name) || {
        topic: tag.name,
        slug: tag.slug,
        solved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        failedRecent: 0,
        acceptedRecent: 0,
        recentProblems: []
      };

      current.solved += 1;
      current[question.difficulty.toLowerCase()] += 1;
      current.failedRecent += failedBySlug[question.titleSlug] || 0;
      current.acceptedRecent += recentSubmissions.some(
        (submission) => submission.titleSlug === question.titleSlug && submission.statusDisplay === "Accepted"
      )
        ? 1
        : 0;
      current.recentProblems.push(question.title);
      topics.set(tag.name, current);
    }
  }

  return [...topics.values()]
    .map((topic) => ({
      ...topic,
      acceptanceSignal: topic.acceptedRecent / Math.max(1, topic.acceptedRecent + topic.failedRecent),
      strength: Math.max(
        5,
        Math.min(98, Math.round(topic.solved * 14 + topic.medium * 7 + topic.hard * 12 - topic.failedRecent * 10))
      )
    }))
    .sort((a, b) => b.strength - a.strength);
}

function buildAttemptStats(recentSubmissions, recentQuestions) {
  const questionBySlug = new Map(recentQuestions.map((question) => [question.titleSlug, question]));
  const statusCounts = {};
  const languageCounts = {};
  const problemAttempts = {};
  const topicAttempts = {};

  for (const submission of recentSubmissions) {
    statusCounts[submission.statusDisplay] = (statusCounts[submission.statusDisplay] || 0) + 1;
    languageCounts[submission.lang] = (languageCounts[submission.lang] || 0) + 1;
    const problem = problemAttempts[submission.titleSlug] || {
      title: submission.title,
      titleSlug: submission.titleSlug,
      accepted: 0,
      failed: 0,
      lastTimestamp: Number(submission.timestamp || 0)
    };

    if (submission.statusDisplay === "Accepted") problem.accepted += 1;
    else problem.failed += 1;
    problem.lastTimestamp = Math.max(problem.lastTimestamp, Number(submission.timestamp || 0));
    problemAttempts[submission.titleSlug] = problem;

    const question = questionBySlug.get(submission.titleSlug);
    for (const tag of question?.topicTags || []) {
      const topic = topicAttempts[tag.name] || { topic: tag.name, accepted: 0, failed: 0, attempts: 0 };
      topic.attempts += 1;
      if (submission.statusDisplay === "Accepted") topic.accepted += 1;
      else topic.failed += 1;
      topicAttempts[tag.name] = topic;
    }
  }

  const failedRecent = recentSubmissions.filter((submission) => submission.statusDisplay !== "Accepted").length;
  const acceptedRecent = recentSubmissions.filter((submission) => submission.statusDisplay === "Accepted").length;

  return {
    totalRecent: recentSubmissions.length,
    acceptedRecent,
    failedRecent,
    recentAcceptanceRate: recentSubmissions.length ? Math.round((acceptedRecent / recentSubmissions.length) * 100) : 0,
    statusCounts,
    languageCounts,
    problemAttempts: Object.values(problemAttempts).sort((a, b) => b.failed - a.failed || b.lastTimestamp - a.lastTimestamp),
    topicAttempts: Object.values(topicAttempts).sort((a, b) => b.failed - a.failed || b.attempts - a.attempts)
  };
}

const localQuestionBank = [
  { slug: "two-sum", title: "Two Sum", topic: "Array", difficulty: "Easy", pattern: "Hashing", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "contains-duplicate", title: "Contains Duplicate", topic: "Array", difficulty: "Easy", pattern: "Hashing", sheets: ["strivers", "neetcode"] },
  { slug: "product-of-array-except-self", title: "Product of Array Except Self", topic: "Array", difficulty: "Medium", pattern: "Prefix product", sheets: ["strivers", "gfg160"] },
  { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", topic: "Sliding Window", difficulty: "Medium", pattern: "Variable window", sheets: ["strivers", "neetcode"] },
  { slug: "minimum-window-substring", title: "Minimum Window Substring", topic: "Sliding Window", difficulty: "Hard", pattern: "Variable window", sheets: ["neetcode"] },
  { slug: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", pattern: "Modified binary search", sheets: ["neetcode"] },
  { slug: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", pattern: "Boundary search", sheets: ["neetcode"] },
  { slug: "merge-intervals", title: "Merge Intervals", topic: "Intervals", difficulty: "Medium", pattern: "Sort and sweep", sheets: ["strivers"] },
  { slug: "insert-interval", title: "Insert Interval", topic: "Intervals", difficulty: "Medium", pattern: "Merge", sheets: ["neetcode"] },
  { slug: "valid-parentheses", title: "Valid Parentheses", topic: "Stack", difficulty: "Easy", pattern: "Stack", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "daily-temperatures", title: "Daily Temperatures", topic: "Stack", difficulty: "Medium", pattern: "Monotonic stack", sheets: ["neetcode"] },
  { slug: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", topic: "Stack", difficulty: "Hard", pattern: "Monotonic stack", sheets: ["strivers"] },
  { slug: "reverse-linked-list", title: "Reverse Linked List", topic: "Linked List", difficulty: "Easy", pattern: "Pointer reversal", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "Easy", pattern: "Two pointers", sheets: ["strivers", "gfg160"] },
  { slug: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", topic: "Tree", difficulty: "Medium", pattern: "BFS", sheets: ["strivers", "neetcode"] },
  { slug: "lowest-common-ancestor-of-a-binary-tree", title: "Lowest Common Ancestor of a Binary Tree", topic: "Tree", difficulty: "Medium", pattern: "DFS", sheets: ["strivers"] },
  { slug: "number-of-islands", title: "Number of Islands", topic: "Graph", difficulty: "Medium", pattern: "DFS/BFS", sheets: ["strivers", "neetcode", "gfg160"] },
  { slug: "clone-graph", title: "Clone Graph", topic: "Graph", difficulty: "Medium", pattern: "Graph traversal", sheets: ["neetcode"] },
  { slug: "course-schedule", title: "Course Schedule", topic: "Graph", difficulty: "Medium", pattern: "Topological sort", sheets: ["gfg160"] },
  { slug: "network-delay-time", title: "Network Delay Time", topic: "Graph", difficulty: "Medium", pattern: "Dijkstra", sheets: ["neetcode"] },
  { slug: "coin-change", title: "Coin Change", topic: "Dynamic Programming", difficulty: "Medium", pattern: "1D DP", sheets: ["strivers", "neetcode"] },
  { slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", topic: "Dynamic Programming", difficulty: "Medium", pattern: "DP with binary search", sheets: ["strivers"] },
  { slug: "word-break", title: "Word Break", topic: "Dynamic Programming", difficulty: "Medium", pattern: "String DP", sheets: ["neetcode"] },
  { slug: "partition-equal-subset-sum", title: "Partition Equal Subset Sum", topic: "Dynamic Programming", difficulty: "Medium", pattern: "Knapsack", sheets: ["strivers"] },
  { slug: "combination-sum", title: "Combination Sum", topic: "Backtracking", difficulty: "Medium", pattern: "Backtracking", sheets: ["strivers", "gfg160"] },
  { slug: "subsets", title: "Subsets", topic: "Backtracking", difficulty: "Medium", pattern: "Backtracking", sheets: ["gfg160"] },
  { slug: "jump-game", title: "Jump Game", topic: "Greedy", difficulty: "Medium", pattern: "Greedy reachability", sheets: ["gfg160"] },
  { slug: "task-scheduler", title: "Task Scheduler", topic: "Heap (Priority Queue)", difficulty: "Medium", pattern: "Heap", sheets: ["neetcode"] },
  { slug: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", topic: "Trie", difficulty: "Medium", pattern: "Trie", sheets: ["neetcode"] },
  { slug: "number-of-1-bits", title: "Number of 1 Bits", topic: "Bit Manipulation", difficulty: "Easy", pattern: "Bit tricks", sheets: ["neetcode"] },
  { slug: "accounts-merge", title: "Accounts Merge", topic: "Union Find", difficulty: "Medium", pattern: "Union Find", sheets: ["neetcode"] }
];

export async function fetchLeetcodeProfile(username) {
  const trimmedUsername = username.trim();
  const data = await leetcodeGraphql(profileQuery, { username: trimmedUsername });

  if (!data.matchedUser) {
    throw new ApiError(404, "No public LeetCode profile found for this username.");
  }

  const uniqueSlugs = [
    ...new Set([
      ...(data.recentAcSubmissionList || []).map((item) => item.titleSlug),
      ...(data.recentSubmissionList || []).slice(0, 50).map((item) => item.titleSlug)
    ])
  ];

  const localMap = new Map(localQuestionBank.map((q) => [q.slug, q]));
  const resolvedQuestions = [];
  const remoteSlugsToFetch = [];

  for (const slug of uniqueSlugs) {
    if (localMap.has(slug)) {
      const q = localMap.get(slug);
      resolvedQuestions.push({
        title: q.title,
        titleSlug: q.slug,
        difficulty: q.difficulty,
        topicTags: [{ name: q.topic, slug: q.topic.toLowerCase() }]
      });
    } else {
      remoteSlugsToFetch.push(slug);
    }
  }

  const [calendarData, remoteQuestions] = await Promise.all([
    leetcodeGraphql(calendarQuery, { username: trimmedUsername, year: new Date().getFullYear() }).catch(() => null),
    Promise.all(
      remoteSlugsToFetch.slice(0, 40).map(async (titleSlug) => {
        try {
          const questionData = await leetcodeGraphql(questionQuery, { titleSlug });
          return questionData.question;
        } catch {
          return null;
        }
      })
    )
  ]);

  const cleanQuestions = [...resolvedQuestions, ...remoteQuestions.filter(Boolean)];
  const calendar = calendarData?.matchedUser?.userCalendar || {};
  const counts = normalizeCounts(data.matchedUser.submitStatsGlobal);
  const recentSubmissions = data.recentSubmissionList || [];
  const topicInsights = buildTopicInsights(cleanQuestions, recentSubmissions);
  const attemptStats = buildAttemptStats(recentSubmissions, cleanQuestions);

  return {
    source: "leetcode",
    fetchedAt: new Date(),
    username: data.matchedUser.username,
    profile: data.matchedUser.profile,
    counts,
    contest: data.userContestRanking,
    calendar: {
      activeYears: calendar.activeYears || [],
      streak: calendar.streak || 0,
      totalActiveDays: calendar.totalActiveDays || 0,
      submissionsByDay: parseCalendar(calendar.submissionCalendar)
    },
    recentAccepted: data.recentAcSubmissionList || [],
    recentSubmissions,
    recentQuestions: cleanQuestions,
    topicInsights,
    attemptStats,
    syncQuality: {
      recentSubmissionCount: recentSubmissions.length,
      enrichedQuestionCount: cleanQuestions.length,
      hasCalendar: Boolean(calendarData)
    },
    limitations: {
      calendar: calendarData ? null : "LeetCode did not expose calendar data for this profile."
    }
  };
}
