# Contributing Guidelines & Git Architecture

To maintain production stability and data integrity for live assessments, direct pushes to `main` and `develop` are strictly prohibited.

## 1. Branching Model

- **`main`**: Production release line. Deployed to Vercel production.
- **`develop`**: Integration trunk. All active feature work converges here.
- **`feature/*`**: New user-facing capabilities, UI components, or testing workflows.
- **`fix/*`**: Bug fixes, security patches, or hotfixes.

## 2. Pull Request Requirement

1. **Zero Direct Pushes**: All changes must enter `develop` via a GitHub Pull Request.
2. **Branch Protection**: Direct pushes to `develop` are rejected by branch protection rules.
3. **Automated Status Checks**: PRs must pass automated build and Playwright tests before merge.
4. **Clean Commits**: Follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `chore:`).

## 3. Automated Agent & AI Protocols (Copilot / Bots)

- Automated coding agents (GitHub Copilot CLI, bots, workflows) **may only open PRs**.
- No agent or background runner is permitted to bypass PR review or merge directly into `develop`.
- Every agent PR must include a clear summary of changes and reference its tracking issue.

## 4. Assessment Architecture Overview

- **Client Tier**: Next.js App Router providing student kiosk UI, input sanitization, and focus watchdogs.
- **Realtime Sync**: Firebase Firestore snapshot listeners managing session state, teacher PIN lockouts, and live rosters.
- **Grading Engine**: Isolated server/client scoring math with attempt limits and automated score aggregation.
