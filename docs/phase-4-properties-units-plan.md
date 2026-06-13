# Phase 4: Properties And Units Plan

## Goal

Build the first complete CRUD workflow for the app:

```text
Properties -> Units
```

This phase should produce a real usable slice:

- A landlord can view properties.
- A landlord can create and edit properties.
- A landlord can archive properties.
- A landlord can view units inside a property.
- A landlord can create, edit, and archive units.

## Learning Focus

Backend:

- DTO validation.
- Route design.
- Workspace-scoped writes.
- Archive instead of hard delete.
- Error handling.
- E2E tests for create/update/archive flows.

Frontend:

- App shell.
- API client.
- Data fetching.
- Forms.
- Validation.
- Loading, error, and empty states.
- Mobile-friendly admin screens.

## Product Scope

### Property

A property is the physical place.

Examples:

- House
- Building
- Apartment
- Rooming house

Fields:

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Example: `Casa Virreyes` |
| `street` | no | Keep optional for privacy/simple use |
| `city` | no | Default examples use Morelia |
| `state` | no | Default examples use Michoacan |
| `notes` | no | Internal notes |

Decision:

- Backend keeps `city` and `state` optional.
- Frontend may prefill `Morelia` and `Michoacan` later as UI defaults for local convenience.
- Users should still be able to clear or change those values.

### Unit

A unit is the rentable space inside a property.

Examples:

- Full house
- Apartment
- Room
- Studio
- Back unit

Fields:

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Example: `Cuarto 1` |
| `defaultRentCents` | no | Optional pre-fill for future contracts |
| `status` | yes | Starts as `AVAILABLE` by default |
| `notes` | no | Internal notes |

Decision:

- Backend keeps `status`.
- UI should default to `AVAILABLE`.
- UI may expose `MAINTENANCE` and `INACTIVE` in a simple details/advanced area.
- Do not add `OCCUPIED` as a manual status in Phase 4. Occupancy should come from contracts later.

## Backend Endpoints

All endpoints are protected by `JwtGuard`.

All reads and writes must be scoped to the authenticated user's default workspace through `WorkspacesService`.

### Properties

Current:

- `GET /properties`
- `GET /properties/:id`

Add:

- `POST /properties`
- `PATCH /properties/:id`
- `PATCH /properties/:id/archive`

Behavior:

- Create property in the current user's default workspace.
- Update only properties in the current user's workspace.
- Archive by setting `archivedAt`, not by deleting.
- Archived properties should not appear in normal list/detail queries.
- Return `404` if a property does not exist in the user's workspace.
- Block archiving a property if it still has active units.
- Return a clear `400`/business error telling the user to archive units first.

### Units

Add:

- `GET /properties/:propertyId/units`
- `POST /properties/:propertyId/units`
- `PATCH /units/:id`
- `PATCH /units/:id/archive`

Behavior:

- Units must belong to a property in the current user's workspace.
- Create unit under the selected property.
- Update only units in the current user's workspace.
- Archive by setting `archivedAt`, not by deleting.
- Archived units should not appear in normal unit lists.
- Return `404` if the property/unit does not exist in the user's workspace.
- Hide archived units by default.
- A "view archived" filter can be added later if users need it.

## DTOs And Validation

Use DTO classes with `class-validator`.

### CreatePropertyDto

Rules:

- `name`: required, string, non-empty.
- `street`: optional string.
- `city`: optional string.
- `state`: optional string.
- `notes`: optional string.

### UpdatePropertyDto

Rules:

- Same fields as create, but all optional.
- Empty update body should be rejected or treated carefully.

Recommendation:

- Reject empty update bodies with `400` once a clean helper exists.
- If too much friction, allow it temporarily and document as a known improvement.

### CreateUnitDto

Rules:

- `name`: required, string, non-empty.
- `defaultRentCents`: optional integer, minimum `0`.
- `status`: optional enum, default `AVAILABLE`.
- `notes`: optional string.

### UpdateUnitDto

Rules:

- Same fields as create, but all optional.
- `status` must be one of Prisma `UnitStatus` values.

## Backend Testing

Use backend e2e tests first.

Properties tests:

- Create property succeeds with valid token.
- Create property rejects missing/invalid body with `400`.
- Update property succeeds for current workspace.
- Archive property hides it from `GET /properties`.
- Archived property detail returns `404`.
- Missing token returns `401`.

Units tests:

- List units for property succeeds with valid token.
- Create unit succeeds under current workspace property.
- Create unit for fake property returns `404`.
- Update unit succeeds.
- Archive unit hides it from unit list.
- Missing token returns `401`.

Test data note:

- Current e2e tests rely on seed data.
- For create/update/archive tests, prefer creating test records inside the test instead of mutating seeded records like `Casa Virreyes`.

## Frontend Screens

Start simple. Spanish LATAM UI copy.

### App Shell

Needed before real screens:

- Basic protected admin layout.
- Navigation.
- API base URL usage.
- Simple token handling for development.

### Properties List

Show:

- Property name.
- City/state if present.
- Number of active units.
- Empty state.
- Loading state.
- Error state.
- Create property action.

### Property Detail

Show:

- Property details.
- Active units list.
- Create unit action.
- Edit property action.
- Archive property action.

### Property Form

Fields:

- Name.
- Street.
- City.
- State.
- Notes.

### Unit Form

Fields:

- Name.
- Default rent.
- Status.
- Notes.

## UI/UX Direction

This should feel like a practical admin dashboard, not a landing page.

Principles:

- Dense but readable.
- Mobile-friendly.
- Clear forms.
- No decorative hero sections.
- No oversized cards for basic admin content.
- Always show loading, error, empty, and disabled states.

Before building major UI, create:

```text
docs/design.md
```

The design doc should define:

- app tone
- layout
- colors
- typography
- navigation
- table/list behavior
- form behavior
- mobile behavior

## Out Of Scope For Phase 4

- Contracts.
- Payments.
- Expenses.
- File uploads.
- Reports.
- Tenant portal.
- Invitations.
- Complex role permissions.
- Real workspace switcher UI.
- Full production-grade token storage.
- Pagination unless lists become noisy.
- Archived records filter.

## Implementation Order

1. Add property create/update/archive DTOs and endpoints.
2. Add property e2e tests.
3. Add unit module/service/controller.
4. Add unit DTOs and endpoints.
5. Add unit e2e tests.
6. Update Bruno collection.
7. Create design doc before frontend UI.
8. Build frontend app shell.
9. Build properties list/detail/forms.
10. Update docs and interview notes.

## Open Questions

1. Should archive require confirmation text/modal in the UI?
2. Should the first frontend token handling be simple bearer-token storage for development, or should we move directly toward HttpOnly cookies?
