# DSA Mistake Tracker

A full-stack MERN application that helps developers systematically improve their problem-solving skills by combining manual mistake tracking, automated LeetCode analytics, adaptive revision scheduling, and AI-powered performance insights.

## Features

- Secure authentication using JWT access tokens, rotating HTTP-only refresh tokens, bcrypt password hashing, rate limiting, Helmet, CORS, and request validation.
- Live LeetCode integration via GraphQL to fetch solved problems, submission history, activity calendar, contest data, and topic insights.
- Intelligent mistake logging with root cause analysis, difficulty, topic, pattern, severity, notes, and scheduled revision reminders.
- Adaptive recommendation engine that generates personalized practice questions and revision plans using LeetCode activity, mistake history, and revision performance.
- AI-powered analysis using the OpenAI Responses API with automatic fallback to a deterministic rule-based engine when no API key is configured.
- Analytics dashboard with progress tracking, revision statistics, topic-wise performance, mistake trends, and consistency metrics.
- Pattern tracking to identify recurring weaknesses and measure long-term improvement.
- Responsive React UI with light/dark themes built using Vite.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Security
- JWT Authentication
- HTTP-only Refresh Cookies
- bcrypt
- Helmet
- CORS
- Express Rate Limiting

### External APIs
- LeetCode GraphQL API
- OpenAI Responses API 

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Configure the following environment variables:

```env
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
OPENAI_API_KEY=   # Optional
```

The application automatically switches to a built-in rule-based analysis engine if the OpenAI API key is not provided.

## Workflow

1. Register or log in securely.
2. Connect your LeetCode username.
3. Sync your latest LeetCode profile and activity.
4. Log mistakes with detailed reasoning and root causes.
5. Review scheduled revision sessions.
6. Monitor recurring patterns and weak topics.
7. Generate AI or rule-based performance analysis.
8. Follow personalized practice recommendations based on your learning history.

## Architecture

- **Frontend:** React + Vite
- **Backend:** Express REST API
- **Database:** MongoDB
- **Authentication:** JWT + Refresh Token Rotation
- **Data Sources:** LeetCode GraphQL + User-generated learning data
- **Analysis Engine:** OpenAI Responses API with deterministic fallback

## Note

LeetCode's public GraphQL API does not expose private failed submissions or personal reasoning behind incorrect solutions. The application combines publicly available LeetCode data with user-recorded mistakes, revision history, and learning patterns to generate personalized recommendations and performance analysis.
