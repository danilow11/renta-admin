# Agent Instructions

This repository is Daniel Alvarez's interview-preparation project.

The goal is to build a real full-stack landlord/property-management application while strengthening front-end interview fundamentals.

Primary stack:

- Next.js + TypeScript for the frontend
- NestJS + TypeScript for the backend
- PostgreSQL for the database
- Prisma for ORM and migrations

Source-of-truth docs:

- `docs/project-plan.md` defines project goals, phases, stack, and delivery scope.
- `docs/domain-model.md` defines product entities, business rules, and deferred features.
- Future design decisions should live in `docs/design.md` once UI work begins.

Daniel's positioning goal:

- Front-end developer with strong React/Next.js experience
- Recent hands-on backend exposure
- Comfortable discussing APIs, auth, data modeling, permissions, testing, and deployment
- Not pretending to be a senior backend/full-stack specialist

Working style:

- Teach while implementing.
- Prefer small, reviewable steps.
- Explain important choices in plain language.
- Ask before changing architecture, package choices, folder structure, auth strategy, database schema, or deployment approach.
- Do not autopilot large features.
- Do not run destructive commands.
- Do not modify user changes unless explicitly asked.
- Use libraries professionally, but explain what they are doing when they matter for interviews.

Learning goals to reinforce organically:

- React and Next.js rendering behavior
- TypeScript fundamentals
- Forms, validation, state, and server/client boundaries
- Loading, error, empty, and accessibility states
- Debounce/throttle, memoization, pagination, filtering, optimistic updates, and lazy loading
- API design, auth, RBAC, database relationships, migrations, and backend validation
- Testing with practical coverage, not test theater

Avoid inspecting or editing generated/dependency folders unless explicitly asked:

- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `coverage/`
- `apps/web/.next/`
- `apps/web/next-env.d.ts`
- `apps/api/dist/`
- `.kilo/node_modules/`

Expected task flow:

1. Restate the task briefly.
2. Identify the files likely to change.
3. Implement the smallest useful version.
4. Run relevant checks when available.
5. Summarize what changed and what Daniel should understand for interviews.
