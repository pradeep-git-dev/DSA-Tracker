const STORAGE_KEY = "dsa-tracker-state-v1";

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

const demoProfile = {
  source: "demo",
  username: "Demo learner",
  profile: { ranking: 82412, reputation: 24 },
  counts: {
    solved: { all: 148, easy: 52, medium: 81, hard: 15 },
    submissions: { all: 231, easy: 74, medium: 129, hard: 28 }
  },
  calendar: {
    streak: 6,
    totalActiveDays: 43,
    submissionsByDay: buildDemoCalendar()
  },
  topicInsights: [
    { topic: "Array", strength: 86, solved: 31, easy: 12, medium: 17, hard: 2 },
    { topic: "Binary Search", strength: 74, solved: 17, easy: 5, medium: 10, hard: 2 },
    { topic: "Tree", strength: 66, solved: 16, easy: 7, medium: 8, hard: 1 },
    { topic: "Sliding Window", strength: 55, solved: 10, easy: 2, medium: 8, hard: 0 },
    { topic: "Dynamic Programming", strength: 42, solved: 9, easy: 1, medium: 7, hard: 1 },
    { topic: "Graph", strength: 36, solved: 7, easy: 1, medium: 5, hard: 1 }
  ],
  recommendations: {
    weakTopics: [
      { topic: "Dynamic Programming", reason: "Low recent confidence" },
      { topic: "Graph", reason: "Needs traversal variety" },
      { topic: "Trie", reason: "Not covered yet" },
      { topic: "Union Find", reason: "Not covered yet" }
    ],
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
      }
    ]
  }
};

const state = loadState();
let currentProfile = state.profile || demoProfile;

const elements = {
  form: document.querySelector("#leetcodeForm"),
  username: document.querySelector("#leetcodeUsername"),
  syncStatus: document.querySelector("#syncStatus"),
  profilePill: document.querySelector("#profilePill"),
  solvedMetric: document.querySelector("#solvedMetric"),
  solvedBreakdown: document.querySelector("#solvedBreakdown"),
  accuracyMetric: document.querySelector("#accuracyMetric"),
  activeDaysMetric: document.querySelector("#activeDaysMetric"),
  streakMetric: document.querySelector("#streakMetric"),
  revisionDueMetric: document.querySelector("#revisionDueMetric"),
  topicList: document.querySelector("#topicList"),
  coverageList: document.querySelector("#coverageList"),
  heatmap: document.querySelector("#activityHeatmap"),
  mistakeForm: document.querySelector("#mistakeForm"),
  mistakeLog: document.querySelector("#mistakeLog"),
  practiceList: document.querySelector("#practiceList"),
  revisionList: document.querySelector("#revisionList"),
  generatePlanBtn: document.querySelector("#generatePlanBtn"),
  clearDoneBtn: document.querySelector("#clearDoneBtn"),
  curve: document.querySelector("#learningCurve")
};

render();

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = new FormData(elements.form).get("username").trim();
  if (!username) return;

  setSyncStatus("Syncing public LeetCode profile...");

  try {
    const response = await fetch(`/api/leetcode/${encodeURIComponent(username)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "LeetCode sync failed.");

    currentProfile = payload;
    state.profile = payload;
    state.username = username;
    saveState();
    setSyncStatus(`Synced ${username} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`);
    render();
  } catch (error) {
    setSyncStatus(`${error.message} Showing saved/demo data.`);
  }
});

elements.mistakeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(elements.mistakeForm));
  state.mistakes.unshift({
    id: crypto.randomUUID(),
    problem: data.problem.trim(),
    topic: data.topic,
    mistakeType: data.mistakeType,
    note: data.note.trim(),
    createdAt: new Date().toISOString(),
    reviewCount: 0,
    done: false
  });
  elements.mistakeForm.reset();
  saveState();
  render();
});

elements.mistakeLog.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const mistake = state.mistakes.find((item) => item.id === button.dataset.id);
  if (!mistake) return;

  if (button.dataset.action === "review") {
    mistake.reviewCount += 1;
    mistake.lastReviewedAt = new Date().toISOString();
  }

  if (button.dataset.action === "done") {
    mistake.done = !mistake.done;
  }

  saveState();
  render();
});

elements.clearDoneBtn.addEventListener("click", () => {
  state.mistakes = state.mistakes.filter((mistake) => !mistake.done);
  saveState();
  render();
});

elements.generatePlanBtn.addEventListener("click", () => {
  state.planVersion += 1;
  saveState();
  render();
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      username: saved.username || "",
      profile: saved.profile || null,
      mistakes: saved.mistakes || seedMistakes(),
      planVersion: saved.planVersion || 1
    };
  } catch {
    return { username: "", profile: null, mistakes: seedMistakes(), planVersion: 1 };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  elements.username.value = state.username || "";
  renderProfile();
  renderMetrics();
  renderCurve();
  renderTopics();
  renderCoverage();
  renderHeatmap();
  renderMistakes();
  renderPractice();
  renderRevisionPlan();
}

function renderProfile() {
  const name = currentProfile.profile?.realName || currentProfile.username || "DSA learner";
  const rank = currentProfile.profile?.ranking ? `Rank ${currentProfile.profile.ranking.toLocaleString()}` : "Local progress";
  const avatar = currentProfile.profile?.userAvatar
    ? `<span class="avatar"><img src="${escapeHtml(currentProfile.profile.userAvatar)}" alt="" /></span>`
    : `<span class="avatar">${initials(name)}</span>`;

  elements.profilePill.innerHTML = `
    ${avatar}
    <div>
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(rank)}</span>
    </div>
  `;
}

function renderMetrics() {
  const solved = currentProfile.counts.solved;
  const submissions = currentProfile.counts.submissions;
  const accuracy = submissions.all ? Math.round((solved.all / submissions.all) * 100) : 0;
  const due = buildRevisionPlan().filter((item) => item.status === "Due").length;

  elements.solvedMetric.textContent = solved.all.toLocaleString();
  elements.solvedBreakdown.textContent = `Easy ${solved.easy} · Medium ${solved.medium} · Hard ${solved.hard}`;
  elements.accuracyMetric.textContent = `${accuracy}%`;
  elements.activeDaysMetric.textContent = (currentProfile.calendar.totalActiveDays || 0).toLocaleString();
  elements.streakMetric.textContent = `Current streak ${currentProfile.calendar.streak || 0} days`;
  elements.revisionDueMetric.textContent = due;
}

function renderCurve() {
  const canvas = elements.curve;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(600, Math.floor(rect.width * ratio));
  canvas.height = Math.floor(240 * ratio);
  context.scale(ratio, ratio);

  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  const padding = 30;
  const data = buildCurveData();
  const max = Math.max(...data.map((point) => point.value), 8);

  context.clearRect(0, 0, width, height);
  context.strokeStyle = "#dbe2df";
  context.lineWidth = 1;
  for (let index = 0; index < 4; index += 1) {
    const y = padding + ((height - padding * 2) / 3) * index;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  context.beginPath();
  data.forEach((point, index) => {
    const x = padding + ((width - padding * 2) / (data.length - 1)) * index;
    const y = height - padding - (point.value / max) * (height - padding * 2);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.strokeStyle = "#2667ff";
  context.lineWidth = 3;
  context.stroke();

  context.lineTo(width - padding, height - padding);
  context.lineTo(padding, height - padding);
  context.closePath();
  context.fillStyle = "rgba(38, 103, 255, 0.1)";
  context.fill();

  context.fillStyle = "#637176";
  context.font = "12px Inter, sans-serif";
  context.fillText("Last 12 weeks", padding, height - 8);
  context.fillText(`${max} solves/week`, width - padding - 88, 18);
}

function renderTopics() {
  const topics = enrichTopics(currentProfile.topicInsights).slice(0, 7);
  elements.topicList.innerHTML = topics
    .map((topic) => {
      const className = topic.strength >= 70 ? "easy" : topic.strength >= 48 ? "medium" : "hard";
      return `
        <div class="topic-row">
          <header>
            <strong>${escapeHtml(topic.topic)}</strong>
            <span class="tag ${className}">${topic.strength}%</span>
          </header>
          <div class="bar-track"><div class="bar-fill" style="--value: ${topic.strength}%"></div></div>
        </div>
      `;
    })
    .join("");
}

function renderCoverage() {
  const covered = new Set((currentProfile.topicInsights || []).map((topic) => topic.topic));
  const mistakeTopics = countBy(state.mistakes.filter((mistake) => !mistake.done), "topic");
  const weak = [
    ...(currentProfile.recommendations?.weakTopics || []),
    ...coreTopics.filter((topic) => !covered.has(topic)).map((topic) => ({ topic, reason: "Not covered yet" }))
  ];
  const uniqueWeak = uniqueBy(weak, "topic").slice(0, 7);

  elements.coverageList.innerHTML = uniqueWeak
    .map((item) => {
      const count = mistakeTopics[item.topic] || 0;
      return `
        <div class="coverage-item">
          <div>
            <strong>${escapeHtml(item.topic)}</strong>
            <span>${escapeHtml(item.reason || "Needs more practice")}</span>
          </div>
          <span class="tag ${count ? "hard" : ""}">${count ? `${count} mistakes` : "open"}</span>
        </div>
      `;
    })
    .join("");
}

function renderHeatmap() {
  const submissions = currentProfile.calendar.submissionsByDay || {};
  const cells = [];
  const today = startOfDay(new Date());

  for (let offset = 89; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const stamp = Math.floor(date.getTime() / 1000).toString();
    const count = Number(submissions[stamp] || 0);
    const level = count > 8 ? 4 : count > 4 ? 3 : count > 1 ? 2 : count > 0 ? 1 : 0;
    cells.push(`<span class="heat-cell" data-level="${level}" title="${date.toLocaleDateString()}: ${count} submissions"></span>`);
  }

  elements.heatmap.innerHTML = cells.join("");
}

function renderMistakes() {
  if (!state.mistakes.length) {
    elements.mistakeLog.innerHTML = `<div class="empty-state">No mistakes logged yet. Add one after your next solve attempt.</div>`;
    return;
  }

  elements.mistakeLog.innerHTML = state.mistakes
    .slice(0, 8)
    .map(
      (mistake) => `
      <article class="mistake-card">
        <header>
          <div>
            <strong>${escapeHtml(mistake.problem)}</strong>
            <span>${escapeHtml(mistake.topic)} · ${escapeHtml(mistake.mistakeType)}</span>
          </div>
          <span class="tag ${mistake.done ? "done" : "due"}">${mistake.done ? "Done" : "Due"}</span>
        </header>
        <p>${escapeHtml(mistake.note)}</p>
        <div class="revision-meta">
          <span>Reviews ${mistake.reviewCount}</span>
          <span>${formatDate(mistake.createdAt)}</span>
        </div>
        <div class="mistake-actions">
          <button class="icon-button" type="button" title="Mark reviewed" data-action="review" data-id="${mistake.id}">✓</button>
          <button class="icon-button" type="button" title="Toggle done" data-action="done" data-id="${mistake.id}">●</button>
        </div>
      </article>
    `
    )
    .join("");
}

function renderPractice() {
  const mistakeTopics = Object.keys(countBy(state.mistakes.filter((mistake) => !mistake.done), "topic"));
  const apiQuestions = currentProfile.recommendations?.nextQuestions || [];
  const fallback = buildPracticeFromMistakes(mistakeTopics);
  const questions = uniqueBy([...fallback, ...apiQuestions], "title").slice(0, 6);

  elements.practiceList.innerHTML = questions
    .map(
      (question) => `
      <article class="practice-card">
        <header>
          <strong>${escapeHtml(question.title)}</strong>
          <span class="tag ${question.difficulty.toLowerCase()}">${escapeHtml(question.difficulty)}</span>
        </header>
        <span>${escapeHtml(question.topic)}</span>
        <a href="https://leetcode.com/problems/${question.slug}/" target="_blank" rel="noreferrer">Open on LeetCode</a>
      </article>
    `
    )
    .join("");
}

function renderRevisionPlan() {
  const plan = buildRevisionPlan();
  elements.revisionList.innerHTML = plan
    .map(
      (session) => `
      <article class="revision-card">
        <header>
          <strong>${escapeHtml(session.title)}</strong>
          <span class="tag ${session.status === "Due" ? "due" : "easy"}">${session.status}</span>
        </header>
        <span>${escapeHtml(session.focus)}</span>
        <div class="revision-meta">
          <span>${session.date}</span>
          <span>${session.duration}</span>
          <span>${session.drill}</span>
        </div>
      </article>
    `
    )
    .join("");
}

function buildRevisionPlan() {
  const mistakes = state.mistakes.filter((mistake) => !mistake.done);
  const grouped = countBy(mistakes, "topic");
  const topicQueue = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a]);
  const weakQueue = (currentProfile.recommendations?.weakTopics || []).map((item) => item.topic);
  const queue = uniqueBy([...topicQueue, ...weakQueue, "Dynamic Programming", "Graph", "Binary Search"].map((topic) => ({ topic })), "topic")
    .map((item) => item.topic)
    .slice(0, 6);

  const today = startOfDay(new Date());
  return queue.map((topic, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + Math.floor(index / 2));
    const related = mistakes.filter((mistake) => mistake.topic === topic);
    const status = index < 2 || related.length > 1 ? "Due" : "Scheduled";

    return {
      title: `${topic} revision`,
      focus: related[0]?.note || `Rebuild the core pattern and solve one timed follow-up.`,
      date: date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
      duration: related.length > 1 ? "45 min" : "30 min",
      drill: related.length ? `${related.length} mistake${related.length > 1 ? "s" : ""}` : "2 drills",
      status
    };
  });
}

function buildCurveData() {
  const submissions = currentProfile.calendar.submissionsByDay || {};
  const today = startOfDay(new Date());
  const weeks = Array.from({ length: 12 }, (_, index) => ({ label: index, value: 0 }));

  Object.entries(submissions).forEach(([stamp, count]) => {
    const date = new Date(Number(stamp) * 1000);
    const diffDays = Math.floor((today - startOfDay(date)) / 86400000);
    if (diffDays < 0 || diffDays >= 84) return;
    const weekIndex = 11 - Math.floor(diffDays / 7);
    weeks[weekIndex].value += Math.min(Number(count), 6);
  });

  if (weeks.every((week) => week.value === 0)) {
    return [4, 6, 5, 7, 8, 9, 7, 10, 11, 13, 12, 15].map((value, index) => ({ label: index, value }));
  }

  return weeks;
}

function enrichTopics(topics = []) {
  const mistakeCounts = countBy(state.mistakes.filter((mistake) => !mistake.done), "topic");
  const topicMap = new Map(topics.map((topic) => [topic.topic, { ...topic }]));

  Object.entries(mistakeCounts).forEach(([topic, count]) => {
    const existing = topicMap.get(topic) || { topic, strength: 48, solved: 0 };
    existing.strength = Math.max(12, (existing.strength || 48) - count * 9);
    topicMap.set(topic, existing);
  });

  return [...topicMap.values()].sort((a, b) => b.strength - a.strength);
}

function buildPracticeFromMistakes(topics) {
  const bank = {
    "Dynamic Programming": ["coin-change", "Coin Change", "Medium"],
    Graph: ["number-of-islands", "Number of Islands", "Medium"],
    "Binary Search": ["search-in-rotated-sorted-array", "Search in Rotated Sorted Array", "Medium"],
    "Sliding Window": ["minimum-window-substring", "Minimum Window Substring", "Hard"],
    Tree: ["binary-tree-maximum-path-sum", "Binary Tree Maximum Path Sum", "Hard"],
    Stack: ["daily-temperatures", "Daily Temperatures", "Medium"],
    Array: ["product-of-array-except-self", "Product of Array Except Self", "Medium"],
    Greedy: ["jump-game", "Jump Game", "Medium"],
    "Linked List": ["reverse-linked-list-ii", "Reverse Linked List II", "Medium"]
  };

  return topics
    .filter((topic) => bank[topic])
    .map((topic) => ({
      slug: bank[topic][0],
      title: bank[topic][1],
      difficulty: bank[topic][2],
      topic
    }));
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
    return counts;
  }, {});
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function seedMistakes() {
  return [
    {
      id: "seed-1",
      problem: "Coin Change",
      topic: "Dynamic Programming",
      mistakeType: "Wrong pattern",
      note: "Used greedy thinking where optimal substructure was required.",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewCount: 1,
      done: false
    },
    {
      id: "seed-2",
      problem: "Number of Islands",
      topic: "Graph",
      mistakeType: "Missed edge case",
      note: "Forgot to mark visited before exploring neighbors, causing repeated work.",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      reviewCount: 0,
      done: false
    }
  ];
}

function buildDemoCalendar() {
  const calendar = {};
  const today = startOfDay(new Date());
  for (let offset = 0; offset < 90; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    if (offset % 3 === 0 || offset % 7 === 0 || (offset > 20 && offset < 31)) {
      calendar[Math.floor(date.getTime() / 1000)] = 1 + ((offset * 3) % 9);
    }
  }
  return calendar;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date) {
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

function setSyncStatus(message) {
  elements.syncStatus.textContent = message;
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

window.addEventListener("resize", () => renderCurve());
