# Auth Plan

This document defines the Phase 3 auth direction for Renta Admin.

## Goal

Implement a realistic auth foundation in NestJS without turning Phase 3 into a full security platform.

The app should support:

- Email/password login.
- Password hashing.
- Authenticated API routes.
- Workspace-scoped data access.
- Basic Owner/Manager role awareness.

## Decision

Auth belongs in the NestJS API.

```text
Next.js
  -> renders UI and calls the API

NestJS
  -> owns login, auth checks, roles, and workspace access

PostgreSQL
  -> stores users, password hashes, workspaces, and memberships
```

Reason:

- The project goal is to learn backend auth, guards, roles, and API access.
- The API already owns the business data.
- Workspace access must be enforced on the backend, not only in the frontend.

## Not Using For Now

- No Supabase Auth.
- No Auth.js/NextAuth for Phase 3.
- No Google/OAuth login yet.
- No refresh tokens yet.
- No email verification yet.
- No password reset yet.
- No user invitations yet.
- No complex permission matrix beyond Owner and Manager.

These can be added later if they become useful.

## Auth Strategy

Initial strategy:

1. User sends email and password to `POST /auth/login`.
2. API finds the user by email.
3. API verifies the password against `passwordHash`.
4. API returns a signed JWT access token.
5. Client sends the token in the `Authorization` header.
6. NestJS guard validates the token before protected routes run.
7. Services use the authenticated user/workspace context to scope data.

Request header:

```text
Authorization: Bearer <token>
```

## Password Hashing

Passwords must never be stored as plain text.

The database stores:

```text
passwordHash
```

Chosen library:

- `argon2`

Reason:

- It installed and ran successfully in the local Windows setup.
- It is a strong password-hashing option for modern applications.
- `bcrypt` remains the fallback only if `argon2` causes deployment or install issues later.

Rule:

- Hash password when creating/seeding a user.
- Verify password during login.
- Never return `passwordHash` from API responses.

## JWT Payload

Keep the JWT payload small.

Recommended payload:

```ts
{
  sub: user.id,
  email: user.email
}
```

Do not put large user profiles, workspace lists, or permissions inside the token at first.

Reason:

- Tokens are sent on every authenticated request.
- Roles and workspace membership can change.
- Backend should query membership when needed.

## Workspace Context

Current Phase 2 endpoints use a temporary hardcoded workspace:

```text
Propiedades Morelia
```

Phase 3 should replace that with authenticated context.

Initial approach:

- After login, the app can use the user's first/default workspace.
- API routes can accept a workspace id later through a header or route structure.
- Every protected data query must verify the user belongs to the workspace.

Possible request header later:

```text
X-Workspace-Id: <workspaceId>
```

This is not final until frontend workspace switching starts.

## Roles

Current roles:

- `OWNER`
- `MANAGER`

MVP meaning:

- Both can use daily operations.
- Owner-only behavior can wait until workspace settings/invitations exist.

Phase 3 should prepare role checks, but avoid overbuilding a complex permission system.

## Backend Building Blocks

Expected NestJS pieces:

```text
auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  jwt-auth.guard.ts

users/
  users.module.ts
  users.service.ts
```

Likely responsibilities:

- `AuthController`: exposes login route.
- `AuthService`: verifies credentials and signs JWT.
- `UsersService`: finds users by email/id.
- `JwtAuthGuard`: protects routes that require login.
- Future decorator/helper: reads the current user from the request.

## Endpoint Plan

First endpoint:

```text
POST /auth/login
```

Request:

```json
{
  "email": "daniel@example.com",
  "password": "password"
}
```

Response:

```json
{
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "daniel@example.com",
    "name": "Daniel Alvarez"
  }
}
```

Later endpoints:

- `GET /auth/me`
- protected `GET /properties`
- protected `GET /tenants`
- protected `GET /rent-charges`

## Testing Plan

Start with e2e tests:

- Login succeeds with seeded user credentials.
- Login fails with wrong password.
- Protected route rejects requests without token.
- Protected route accepts requests with valid token.

Later tests:

- User cannot access a workspace they do not belong to.
- Manager and Owner role checks work where needed.

## Security Notes

- Keep secrets in `.env`.
- Add `JWT_SECRET` to `.env.example`.
- Use a strong local/dev secret placeholder in `.env.example`, not a real production secret.
- Do not log passwords or tokens.
- Do not return `passwordHash`.
- Prefer short-lived access tokens later.
- Avoid `localStorage` for frontend token storage if we move to cookie-based sessions later.

## Open Decisions

- Whether the frontend should store JWT in memory first or move quickly to HttpOnly cookies.
- How workspace selection should be passed after login.
- Whether Phase 3 protects only API routes first or also adds frontend route protection.
