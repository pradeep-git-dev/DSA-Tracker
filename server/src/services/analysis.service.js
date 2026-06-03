import { env } from "../config/env.js";
import { AnalysisReport } from "../models/AnalysisReport.js";

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "riskLevel", "confidenceScore", "weakSignals", "mistakeThemes", "revisionStrategy", "practiceFocus"],
  properties: {
    summary: { type: "string" },
    riskLevel: { type: "string", enum: ["low", "medium", "high"] },
    confidenceScore: { type: "number" },
    weakSignals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["area", "evidence", "nextAction"],
        properties: {
          area: { type: "string" },
          evidence: { type: "string" },
          nextAction: { type: "string" }
        }
      }
    },
    mistakeThemes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["theme", "count", "correction"],
        properties: {
          theme: { type: "string" },
          count: { type: "number" },
          correction: { type: "string" }
        }
      }
    },
    revisionStrategy: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "cadence", "drill"],
        properties: {
          title: { type: "string" },
          cadence: { type: "string" },
          drill: { type: "string" }
        }
      }
    },
    practiceFocus: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "topic", "difficulty", "reason"],
        properties: {
          title: { type: "string" },
          topic: { type: "string" },
          difficulty: { type: "string" },
          reason: { type: "string" }
        }
      }
    }
  }
};

export async function generateAnalysis(user, dashboard) {
  const signals = compactSignals(dashboard);
  const aiReport = env.openAiApiKey ? await generateOpenAiAnalysis(signals).catch(() => null) : null;
  const report = aiReport || generateRuleAnalysis(signals);

  return AnalysisReport.create({
    user: user._id,
    mode: aiReport ? "ai" : "rule",
    provider: aiReport ? "openai-responses" : "rule-engine",
    model: aiReport ? env.openAiModel : "",
    report,
    sourceSignals: signals
  });
}

async function generateOpenAiAnalysis(signals) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.openAiApiKey}`
    },
    body: JSON.stringify({
      model: env.openAiModel,
      input: [
        {
          role: "system",
          content:
            "You are a precise DSA coach. Analyze only the supplied app and LeetCode signals. Return concrete, non-generic JSON."
        },
        {
          role: "user",
          content: JSON.stringify(signals)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "dsa_analysis",
          strict: true,
          schema: analysisSchema
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI analysis failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const outputText = payload.output_text || extractOutputText(payload.output);
  return JSON.parse(outputText);
}

function extractOutputText(output = []) {
  return output
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === "output_text" || content.type === "text")
    .map((content) => content.text)
    .join("");
}

function compactSignals(dashboard) {
  return {
    user: {
      leetcodeUsername: dashboard.user.leetcodeUsername
    },
    solved: dashboard.metrics.solved,
    submissions: dashboard.metrics.submissions,
    attemptStats: dashboard.leetcode?.attemptStats || {},
    topicInsights: dashboard.topicInsights.slice(0, 12).map((topic) => ({
      topic: topic.topic,
      strength: topic.strength,
      mistakes: topic.mistakes || 0,
      failedRecent: topic.failedRecent || 0,
      confidence: topic.confidence || 0
    })),
    openMistakes: dashboard.mistakes
      .filter((mistake) => mistake.status !== "resolved")
      .slice(0, 25)
      .map((mistake) => ({
        problemTitle: mistake.problemTitle,
        topic: mistake.topic,
        pattern: mistake.pattern,
        mistakeType: mistake.mistakeType,
        severity: mistake.severity,
        reviewCount: mistake.reviewCount,
        rootCause: mistake.rootCause
      })),
    revisions: dashboard.revisions.slice(0, 12).map((session) => ({
      title: session.title,
      focusTopic: session.focusTopic,
      status: session.status,
      scheduledFor: session.scheduledFor
    })),
    recommendations: dashboard.recommendations.questions.slice(0, 8)
  };
}

function generateRuleAnalysis(signals) {
  const weakSignals = signals.topicInsights
    .map((topic) => ({
      area: topic.topic,
      score: 100 - topic.strength + topic.mistakes * 14 + topic.failedRecent * 10,
      evidence: `${topic.strength}% strength, ${topic.mistakes} open mistakes, ${topic.failedRecent} recent failed submissions.`,
      nextAction: `Do one revision drill and one timed ${topic.topic} problem before adding new topics.`
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ area, evidence, nextAction }) => ({ area, evidence, nextAction }));

  const themeCounts = signals.openMistakes.reduce((map, mistake) => {
    const key = `${mistake.mistakeType}:${mistake.pattern}`;
    const current = map.get(key) || {
      theme: `${mistake.mistakeType} in ${mistake.pattern}`,
      count: 0,
      correction: `Before coding, state the invariant for ${mistake.pattern} and dry-run the smallest failing case.`
    };
    current.count += 1;
    map.set(key, current);
    return map;
  }, new Map());

  const mistakeThemes = [...themeCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const practiceFocus = signals.recommendations.slice(0, 5).map((question) => ({
    title: question.title,
    topic: question.topic,
    difficulty: question.difficulty,
    reason: question.reason
  }));

  const failedRecent = signals.attemptStats.failedRecent || 0;
  const riskLevel = weakSignals.length > 3 || failedRecent > 15 ? "high" : failedRecent > 5 ? "medium" : "low";

  return {
    summary: `The current plan is driven by ${signals.openMistakes.length} open mistakes, ${failedRecent} recent failed LeetCode submissions, and ${signals.topicInsights.length} tracked topic signals.`,
    riskLevel,
    confidenceScore: Math.max(35, Math.min(95, 90 - weakSignals.length * 8 - Math.min(25, failedRecent))),
    weakSignals,
    mistakeThemes,
    revisionStrategy: weakSignals.slice(0, 4).map((signal, index) => ({
      title: `${signal.area} correction block`,
      cadence: index < 2 ? "Today and again in 3 days" : "Within 7 days",
      drill: signal.nextAction
    })),
    practiceFocus
  };
}
