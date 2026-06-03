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
  recentAcSubmissionList(username: $username, limit: 50) {
    id
    title
    titleSlug
    timestamp
  }
  recentSubmissionList(username: $username, limit: 50) {
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
        recentProblems: []
      };

      current.solved += 1;
      current[question.difficulty.toLowerCase()] += 1;
      current.failedRecent += failedBySlug[question.titleSlug] || 0;
      current.recentProblems.push(question.title);
      topics.set(tag.name, current);
    }
  }

  return [...topics.values()]
    .map((topic) => ({
      ...topic,
      strength: Math.max(5, Math.min(98, Math.round(topic.solved * 14 + topic.medium * 7 + topic.hard * 12 - topic.failedRecent * 10)))
    }))
    .sort((a, b) => b.strength - a.strength);
}

export async function fetchLeetcodeProfile(username) {
  const trimmedUsername = username.trim();
  const data = await leetcodeGraphql(profileQuery, { username: trimmedUsername });

  if (!data.matchedUser) {
    throw new ApiError(404, "No public LeetCode profile found for this username.");
  }

  const uniqueSlugs = [
    ...new Set([
      ...(data.recentAcSubmissionList || []).map((item) => item.titleSlug),
      ...(data.recentSubmissionList || []).slice(0, 20).map((item) => item.titleSlug)
    ])
  ];

  const [calendarData, questions] = await Promise.all([
    leetcodeGraphql(calendarQuery, { username: trimmedUsername, year: new Date().getFullYear() }).catch(() => null),
    Promise.all(
      uniqueSlugs.slice(0, 40).map(async (titleSlug) => {
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
  const calendar = calendarData?.matchedUser?.userCalendar || {};
  const counts = normalizeCounts(data.matchedUser.submitStatsGlobal);
  const recentSubmissions = data.recentSubmissionList || [];
  const topicInsights = buildTopicInsights(cleanQuestions, recentSubmissions);

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
    limitations: {
      calendar: calendarData ? null : "LeetCode did not expose calendar data for this profile."
    }
  };
}
