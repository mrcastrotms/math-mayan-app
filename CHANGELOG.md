## [6.8.2] - 2026-09-24
### Major Release: Exam Lifecycle Stability & Automated Email Flow
- **Exam Submission & Lifecycle**: Fixed hard crash on submit in `useExamLifecycle.js` by removing undefined `setIsLocked` reference.
- **Client-Side Grading**: Restored `correctAnswer` field in `api/questions` payload to guarantee accurate grade calculation and live dashboard synchronization.
- **Race Condition & Emails**: Patched `ScoreSummaryCard.js` so automated results email triggers strictly after successful Gradebook saving and `reportId` generation.
- **Smart ID Discovery**: Upgraded `api/send-results/route.js` to auto-resolve missing student IDs from `class_rosters` using display names.
- **UI Rendering**: Fixed React child object crash in `StudentAnswersTable.js` via safe field mapping.
- **CI/CD & Infrastructure**: Regenerated pristine `package-lock.json` and resolved linting blocks for automated GitHub Actions and Vercel deployments.

# Changelog

