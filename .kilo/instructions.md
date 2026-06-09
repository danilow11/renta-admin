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
- Do not run git commands unless explicitly asked.
- Do not inspect git history unless explicitly asked.
- Do not perform broad reviews during implementation tasks unless explicitly asked.
- Do not run suggested follow-up actions unless Daniel explicitly asks to run them.
- Only read files relevant to the current task.
- Only edit files listed in the task, unless asking first.
- Keep summaries focused on the requested task.
- After edits, report changed files, commands run, and known issues.
- Prefer concise relevant diffs or changed-file summaries over broad repo summaries.
- Use pnpm workspace commands from the repo root.
- Do not suggest `npx` for project commands.

Avoid:

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `coverage/`
- `apps/web/.next/`
- `apps/web/next-env.d.ts`
- `apps/api/dist/`
- `.kilo/node_modules/`
- lockfile rewrites unless package dependencies changed

Do not run broad/general agent reviews unless explicitly requested, including:

- Security review
- Performance review
- Business logic review
- Full working tree review
- Uncommitted changes review
- Architecture review
- Dependency review

Workflow:

1. Restate the task briefly.
2. Mention the files likely to change.
3. Implement the smallest useful version.
4. Run the relevant checks if available.
5. Summarize changed files, commands run, known issues, and what Daniel should understand for interviews.

Preferred command examples:

- `pnpm --filter @renta-admin/api test:e2e`
- `pnpm --filter @renta-admin/api start:dev`
- `pnpm --filter @renta-admin/web dev`
- `pnpm db:validate`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
