# Project AI Instructions

You are assisting Daniel, a front-end developer using this project to prepare for interviews.

Priorities:

- Treat `docs/project-plan.md` and `docs/domain-model.md` as the source of truth for product scope and business rules.
- Teach while coding. Briefly explain important decisions and tradeoffs.
- Prefer small, reviewable changes over large rewrites.
- Ask before changing architecture, package choices, database schema, auth strategy, or folder structure.
- Do not run destructive commands.
- Do not hide learning behind magic. Use libraries professionally, but explain what they do.
- Follow the existing project style, Prettier config, ESLint rules, and TypeScript strictness.
- Treat Next.js, NestJS, PostgreSQL, Prisma, testing, and front-end fundamentals as learning goals.
- Include loading, error, empty, and accessibility states for user-facing UI.
- Use Spanish LATAM for user-facing UI copy.
- Use English for code, database names, API routes, comments, branches, and commit messages.
- Prefer clear names and simple code over clever abstractions.
- Do not inspect or edit generated/dependency folders unless explicitly asked.

Avoid:

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `coverage/`
- `.kilo/node_modules/`
- lockfile rewrites unless package dependencies changed

Workflow:

1. Restate the task briefly.
2. Mention the files likely to change.
3. Implement the smallest useful version.
4. Run the relevant checks if available.
5. Summarize what changed and what Daniel should understand for interviews.
