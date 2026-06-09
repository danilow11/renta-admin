# Project Plan

## Purpose

Build a real full-stack landlord/property-management application for interview preparation.

The project should help Daniel become a stronger front-end interview candidate with recent hands-on backend exposure. The goal is not to sell himself as a senior full-stack engineer, but as a front-end developer who can understand and contribute across a modern full-stack product.

Primary audience for the product: landlords or small property managers in Mexico, starting with Spanish LATAM.

## Positioning

Interview story:

> I built a full-stack landlord operations app with Next.js, NestJS, PostgreSQL, and Prisma. It covers properties, rentable units, tenants, contracts, payments, expenses, documents, reports, auth, and role-based access. My main focus was strengthening front-end product skills while gaining recent backend experience.

## Stack

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Styling/UI: Tailwind CSS + shadcn/ui + Radix UI primitives
- Frontend testing: Vitest + React Testing Library
- Backend testing: Jest
- E2E testing: Playwright later, after core flows are stable
- API testing: Bruno
- AI execution assistant: Kilo Code + DeepSeek
- Senior planning/review: Codex
- Version control: Git + GitHub
- CI: GitHub Actions later, after scaffold and tests exist
- Deployment: free-first; no paid services or custom domain initially

## Preferred Libraries

These are preferred choices, subject to confirmation when each feature needs them.

- Server state: TanStack Query
- Local UI state: React state and React Context
- Global client state: Zustand only if needed
- Forms: React Hook Form
- Validation: Zod
- Tables: TanStack Table
- Dates: date-fns
- Charts/reports: Recharts or Tremor
- Toast notifications: Sonner
- Icons: Lucide React
- Password hashing: bcrypt or argon2
- Internationalization: Spanish LATAM copy first; add next-intl only if real multi-language support is needed

## Product Scope

The app is an admin dashboard for landlords and small property managers in Mexico.

Core concepts:

- User account
- Workspace
- Workspace members
- Properties
- Rentable units
- Tenants
- Contracts / rental agreements
- Monthly rent charges
- Payments
- Payment attachments
- Expenses
- Expense attachments
- Documents
- Reports

Flexible property model:

- A property can be a house, apartment building, apartment, or rooming house.
- A rentable unit can be a full house, apartment, room, studio, or other rentable space.

Example:

```text
Property: Casa Chapultepec
Units:
  - Cuarto 1
  - Cuarto 2
  - Cuarto 3

Property: Departamentos Centro
Units:
  - Departamento A
  - Departamento B
```

## Initial Assumptions

- Spanish LATAM UI.
- Admin dashboard first; no tenant portal.
- Manual payment tracking only.
- No Stripe.
- No Docker.
- Local PostgreSQL for development.
- Multi-tenant-ready architecture, but not a full SaaS business layer yet.
- No paid hosting, paid database, or custom domain for the first deploy.
- Workspaces are supported internally and exposed through a simple workspace switcher.
- Roles start with Owner and Manager.
- UI copy is Spanish LATAM; code, database, API routes, comments, branches, and commits are English.

## Milestones

### Phase 0: Setup

Goal: clean development environment and AI workflow.

Deliverables:

- VS Code settings
- Prettier and EditorConfig
- Git ignore rules
- Kilo project instructions
- Bruno installed
- Node, pnpm, Git, Git Bash, and PostgreSQL verified
- GitHub repository ready when appropriate
- Project plan documented

Learning focus:

- Real-world tooling hygiene
- How AI-assisted development will work

### Phase 1: Scaffold

Goal: create the base monorepo structure.

Deliverables:

- Next.js app
- NestJS API
- Shared TypeScript conventions
- Root package scripts
- ESLint configured for actual repo structure
- Prettier working

Learning focus:

- Project structure
- Package scripts
- Frontend/backend separation
- Tooling basics

### Phase 2: Database And Domain Model

Goal: model the core business entities.

Deliverables:

- Prisma setup
- PostgreSQL connection
- Initial schema
- Migrations
- Seed data

Entities:

- User
- Workspace
- WorkspaceMember
- Property
- Unit
- Tenant
- Contract
- RentCharge
- Payment
- PaymentAttachment
- Expense
- ExpenseAttachment
- ContractAttachment

Learning focus:

- Relational modeling
- One-to-many relationships
- Foreign keys
- Migrations
- Seed scripts

### Phase 3: Auth And Access

Goal: implement a realistic auth foundation.

Deliverables:

- Login
- Register or seeded admin user
- Password hashing
- Session or JWT strategy
- Protected API routes
- Protected frontend routes
- Basic roles

Learning focus:

- Auth flow
- Cookies/JWT tradeoffs
- Guards/middleware
- Role-based access control

### Phase 4: Properties And Units

Goal: create the first complete CRUD workflow.

Deliverables:

- Properties list
- Property detail
- Units list
- Create/edit forms
- Delete or archive behavior
- Empty/loading/error states

Learning focus:

- Forms
- Validation
- Data fetching
- Reusable UI components
- API design
- Backend validation

### Phase 5: Tenants And Contracts

Goal: connect tenants to units through contracts/rental agreements.

Deliverables:

- Tenant management
- Contract/agreement creation
- Active/inactive contract states
- Move-in/move-out dates
- Monthly rent amount

Learning focus:

- More complex forms
- Data relationships in UI
- Conditional UI
- Business rules

### Phase 6: Payments And Expenses

Goal: track money manually.

Deliverables:

- Monthly rent charges
- Payment recording
- Payment status
- Expense recording
- Payment and expense attachments
- Overdue status

Learning focus:

- Derived state
- Filtering
- Sorting
- Pagination
- Date and currency handling
- Backend business rules

### Phase 7: Dashboard And Reports

Goal: make the app useful and interview-friendly.

Deliverables:

- Monthly revenue summary
- Outstanding balance
- Occupancy overview
- Expenses by property
- Basic charts

Learning focus:

- Memoization
- Aggregation
- Charts
- Data visualization
- Frontend performance

### Phase 8: Documents

Goal: add practical file handling.

Deliverables:

- Upload contract/ID/receipt files
- Associate documents to tenants, contracts, payments, expenses, or properties
- List/download documents
- Cloudinary for deployed demo storage

Learning focus:

- File upload
- Backend storage decisions
- Validation
- Security basics
- Lazy loading previews if applicable

### Phase 9: Polish And Testing

Goal: make the project credible.

Deliverables:

- Component tests
- API tests for core flows
- E2E tests for stable critical flows
- Accessibility pass
- Loading/error/empty states reviewed
- Responsive dashboard layout
- README
- Demo seed data

Learning focus:

- React Testing Library
- Backend testing basics
- Accessibility
- Interview explanation

### Phase 10: CI And Free Deployment

Goal: deploy a demo without paid services.

Deliverables:

- GitHub Actions workflow for linting and tests
- Frontend deployed to Vercel Hobby
- Backend deployed to Render Free web service
- Production database on Neon Free Postgres
- File uploads stored in Cloudinary Free
- Environment variable documentation
- No custom domain initially; use platform-provided URLs

Notes:

- GitHub Actions should be added after lint/test scripts exist.
- Husky is optional and should be skipped at first to reduce local friction.
- Render Free web services can spin down when idle, so the first request may be slow.
- Neon Free is the preferred hosted Postgres option because the app still owns auth, API, and business logic in NestJS.
- Cloudinary Free is the preferred deployed file-storage option because Render Free filesystem is temporary.
- Supabase Free can be an alternative database host, but avoid relying on Supabase Auth or Supabase-generated APIs for this project.
- Railway is an alternative if its free/monthly credits are enough, but it is not the default because usage billing adds mental overhead.

## Front-End Interview Topics To Practice Organically

- Debounced search
- Pagination
- Filtering and sorting
- Optimistic updates
- Memoization
- Derived data
- Lazy loading
- Reusable table/list components
- Form validation
- Loading, error, and empty states
- Accessibility
- React rendering behavior
- Next.js server/client boundaries

## Backend Topics To Practice Organically

- API route design
- DTOs
- Validation
- Services/controllers/modules
- Auth
- Guards
- RBAC
- Prisma schema design
- Migrations
- Transactions
- Pagination
- Filtering
- File upload
- Testing

## AI Workflow

Default workflow:

1. Codex defines the task, acceptance criteria, and learning goal.
2. Daniel asks Kilo/DeepSeek to implement the focused task.
3. Daniel reads and runs the code.
4. Codex reviews the result.
5. Daniel fixes, tests, and extracts interview notes.

Kilo modes:

- Ask: explain code, errors, concepts, or alternatives.
- Code: implement one specific task.
- Debug: diagnose a concrete error.

Avoid:

- Autopilot implementation of large features.
- Kilo Plan mode for main roadmap planning.
- MCP until there is a real need.
- Docker while the laptop is unstable with it.

## UI/UX Direction

The UI should feel like a practical operations dashboard, not a marketing site.

Principles:

- Spanish LATAM labels.
- Clear navigation.
- Dense but readable tables.
- Simple forms.
- Useful dashboard summaries.
- Restrained colors.
- No decorative hero sections.
- No oversized cards for basic admin screens.
- Always include loading, error, empty, and disabled states.

Recommended approach:

- Use shadcn/ui components.
- Use Tailwind for layout and spacing.
- Create `docs/design.md` before building major screens.
- Consider the Google Labs DESIGN.md format as a reference for agent-readable design tokens and rationale.
- Use free design references/tools only when helpful.

Possible free tools:

- Figma free tier for simple mockups.
- Penpot as a free/open-source design alternative.
- Excalidraw for quick flows and rough wireframes.
- shadcn/ui examples/components for implementation patterns.

## Questions To Resolve Later

- Exact app name.
- Whether reports should be monthly-first or property-first.
- Which UI screens need wireframes before implementation.
- Whether to add Husky pre-commit/pre-push hooks after the project is stable.
- Whether the final deployment should use Render + Neon or another free option available at that time.

## Deferred Or Out Of Scope

The first MVP intentionally excludes:

- Stripe or paid subscriptions.
- Tenant portal.
- Public marketing landing page.
- Real WhatsApp Business API integration.
- Bulk or group WhatsApp messaging.
- Automatic scheduled reminders.
- Automatic service billing.
- Late fees.
- Multi-currency.
- Real-time updates.
- Offline/PWA support.
- Full audit log.
- Automatic history cleanup.
- User invitations.
- Complex role permissions beyond Owner and Manager.
- Hard deletes for business records.
- Early CSV/PDF/XLSX exports before in-app reports are useful.
- Custom domain.
- Docker.
