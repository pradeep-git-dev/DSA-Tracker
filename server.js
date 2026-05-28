const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");
const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const profileQuery = `
query dsaProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
      reputation
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
  recentAcSubmissionList(username: $username, limit: 40) {
    id
    title
    titleSlug
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
    topicTags {
      name
      slug
    }
  }
}`;

async function leetcodeGraphql(query, variables) {
  const response = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "referer": "https://leetcode.com/",
      "user-agent": "DSA Mistake Tracker/1.0"
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new Error(`LeetCode responded with HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  return payload.data;
}

function normalizeCounts(stats) {
  const accepted = Object.fromEntries(
    (stats?.acSubmissionNum || []).map((item) => [item.difficulty, item.count])
  );
  const attempted = Object.fromEntries(
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
      all: attempted.All || 0,
      easy: attempted.Easy || 0,
      medium: attempted.Medium || 0,
      hard: attempted.Hard || 0
    }
  };
}

function parseCalendar(calendar) {
  try {
    return JSON.parse(calendar || "{}");
  } catch {
    return {};
  }
}

function buildTopicInsights(questions) {
  const topicMap = new Map();

  for (const question of questions) {
    for (const tag of question.topicTags || []) {
      const current = topicMap.get(tag.name) || {
        topic: tag.name,
        slug: tag.slug,
        solved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        recent: []
      };

      current.solved += 1;
      current[question.difficulty.toLowerCase()] += 1;
      current.recent.push(question.title);
      topicMap.set(tag.name, current);
    }
  }

  return [...topicMap.values()]
    .map((topic) => ({
      ...topic,
      strength: Math.min(96, Math.round(topic.solved * 16 + topic.medium * 8 + topic.hard * 14))
    }))
    .sort((a, b) => b.strength - a.strength);
}

function buildRecommendations(topicInsights, counts) {
  const coreTopics = [
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
    "Union Find"
  ];

  const covered = new Set(topicInsights.map((topic) => topic.topic));
  const weakTopics = coreTopics
    .filter((topic) => !covered.has(topic))
    .slice(0, 6)
    .map((topic) => ({ topic, reason: "Not seen in recent accepted submissions" }));

  const hardShare = counts.solved.all ? counts.solved.hard / counts.solved.all : 0;
  if (counts.solved.all > 25 && hardShare < 0.08) {
    weakTopics.unshift({ topic: "Hard problem exposure", reason: "Hard solve share is low" });
  }

  return {
    coveredTopics: topicInsights.slice(0, 10).map((topic) => topic.topic),
    weakTopics: weakTopics.slice(0, 6),
    nextQuestions: [
      {
        title: "Longest Substring Without Repeating Characters",
        topic: "Sliding Window",
        difficulty: "Medium",
        slug: "longest-substring-without-repeating-characters"
      },
      {
        title: "Search in Rotated Sorted Array",
        topic: "Binary Search",
        difficulty: "Medium",
        slug: "search-in-rotated-sorted-array"
      },
      {
        title: "Number of Islands",
        topic: "Graph",
        difficulty: "Medium",
        slug: "number-of-islands"
      },
      {
        title: "Coin Change",
        topic: "Dynamic Programming",
        difficulty: "Medium",
        slug: "coin-change"
      },
      {
        title: "Merge Intervals",
        topic: "Intervals",
        difficulty: "Medium",
        slug: "merge-intervals"
      }
    ]
  };
}

async function fetchProfile(username) {
  const data = await leetcodeGraphql(profileQuery, { username });
  if (!data.matchedUser) {
    const error = new Error("No public LeetCode profile found for this username.");
    error.statusCode = 404;
    throw error;
  }

  const uniqueSlugs = [...new Set((data.recentAcSubmissionList || []).map((item) => item.titleSlug))];
  const [calendarData, questions] = await Promise.all([
    leetcodeGraphql(calendarQuery, { username, year: new Date().getFullYear() }).catch(() => null),
    Promise.all(
      uniqueSlugs.slice(0, 24).map(async (titleSlug) => {
        try {
          const questionData = await leetcodeGraphql(questionQuery, { titleSlug });
          return questionData.question;
        } catch {
          return null;
        }
      })
    )
  ]);

  const cleanQuestions = questions.filter(Boolean);
  const counts = normalizeCounts(data.matchedUser.submitStatsGlobal);
  const topicInsights = buildTopicInsights(cleanQuestions);
  const calendar = calendarData?.matchedUser?.userCalendar || {};

  return {
    source: "leetcode",
    fetchedAt: new Date().toISOString(),
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
    recentQuestions: cleanQuestions,
    topicInsights,
    recommendations: buildRecommendations(topicInsights, counts)
  };
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const safePath = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath || "index.html"));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallbackData) => {
        if (fallbackError) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "content-type": MIME_TYPES[".html"] });
        response.end(fallbackData);
      });
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, { "content-type": MIME_TYPES[extension] || "application/octet-stream" });
    response.end(data);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname.startsWith("/api/leetcode/")) {
    const username = decodeURIComponent(url.pathname.split("/").pop() || "").trim();
    if (!username) {
      sendJson(response, 400, { error: "Username is required." });
      return;
    }

    try {
      const profile = await fetchProfile(username);
      sendJson(response, 200, profile);
    } catch (error) {
      sendJson(response, error.statusCode || 502, {
        error: error.message || "Could not reach LeetCode right now."
      });
    }
    return;
  }

  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`DSA Mistake Tracker is running at http://localhost:${PORT}`);
});
