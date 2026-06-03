# DSA Mistake Tracker

A MERN stack app for secure DSA progress tracking, live LeetCode profile analysis, mistake logging, adaptive practice recommendations, and revision planning.

## Stack

- MongoDB + Mongoose for users, mistakes, revision sessions, patterns, and LeetCode snapshots.
- Express API with Helmet, CORS, validation, rate limits, bcrypt password hashing, access JWTs, and rotating HTTP-only refresh cookies.
- React + Vite UI with light/dark themes, dashboard analytics, mistake workflow, pattern tracking, and dynamic recommendations.
- LeetCode GraphQL integration for public profile, solved counts, calendar, recent submissions, and recent topic inference.
- Optional OpenAI Responses API integration for structured AI analysis. When `OPENAI_API_KEY` is not set, the app falls back to a deterministic rule engine using the same live signals.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` in `.env`.
Set `OPENAI_API_KEY` only if you want AI-generated analysis reports; otherwise the rule-based analyzer remains active.

## Workflows

1. Sign up or log in.
2. Connect a LeetCode username from the dashboard.
3. Sync live profile data.
4. Record mistakes with root cause, pattern, topic, severity, and follow-up date.
5. Review due mistakes and mark revision sessions complete.
6. Track pattern progress.
7. Generate an analysis report from LeetCode attempts, logged mistakes, revision history, and pattern confidence.
8. Use the recommendation page for questions and revision sessions generated from real profile data plus app behavior.

LeetCode public APIs do not expose every private failed submission or personal reasoning mistake, so the app combines public LeetCode activity with first-party mistake and revision data.
