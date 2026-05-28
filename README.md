# DSA Mistake Tracker

A simple DSA dashboard for turning LeetCode progress and personal mistake notes into a focused revision plan.

## Run

```bash
npm start
```

Open `http://localhost:3000`.

## What It Tracks

- LeetCode public profile sync for solved counts, accepted submission history when available, recent topics, and contest/profile metadata.
- Local mistake journal saved in browser storage.
- Strong and weak topic areas based on synced topics plus unresolved mistake patterns.
- Practice recommendations with direct LeetCode links.
- Revision sessions generated from mistakes and weak topics.
- Learning curve, active days heatmap, solved breakdown, accuracy, and revision due count.

LeetCode does not expose every failed submission or private mistake reason through the public profile API, so the app combines public profile analysis with an explicit local mistake log.
