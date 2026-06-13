# Domain Model

## Purpose

Define the core entities and business rules for the landlord/property-management app.

The product is for landlords or small property managers in Mexico. The UI should feel simple for normal people, while the backend stays multi-tenant-ready for interview practice and future SaaS potential.

## Language Rules

- UI copy: Spanish LATAM.
- Code, API routes, database tables, columns, comments, branches, and commit messages: English.
- Code comments should be rare and only explain non-obvious logic.

## Core Entities

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

## Decisions

### 1. Workspace Model

The app uses workspaces internally.

For normal users, this should feel like "mis propiedades", not company software.

Example:

```text
User: Daniel
Workspace: Propiedades de Daniel
```

### 2. Multiple Workspaces

A user can belong to multiple workspaces.

The MVP should:

- Open the user's default workspace after login.
- Include a simple workspace switcher.
- Keep all data isolated by selected workspace.

Example:

```text
User: Daniel

Workspace 1: Propiedades Familia Alvarez
Workspace 2: Propiedades Tia Laura
```

### 3. Workspace Roles

The MVP supports two roles:

- Owner
- Manager

Both can manage daily operations:

- Dashboard
- Properties
- Units
- Tenants
- Contracts
- Payments
- Expenses
- Attachments
- Reports
- WhatsApp contact

Owner-only capabilities are reserved for workspace administration:

- Workspace settings
- Invite/remove users later
- Change roles later
- Archive workspace later

Invitations are not part of the first implementation, but the database should be ready for roles.

Naming note:

- `WorkspaceMember` is the Prisma model/table name.
- A "membership" means one `WorkspaceMember` record.
- The membership links one user to one workspace and stores that user's role.

### 4. Properties And Units

A property is the physical place.

A unit is the rentable space inside that property.

Examples:

```text
Property: Casa Chapultepec
Units:
  - Casa completa
```

```text
Property: Casa Ventura
Units:
  - Cuarto 1
  - Cuarto 2
  - Departamento trasero
```

```text
Property: Edificio Centro
Units:
  - Departamento A
  - Departamento B
```

### 5. Contract Per Unit

A unit can have only one active contract at a time.

Each contract has one primary tenant responsible for rent.

If multiple people live in the unit, store them later as notes or occupants. Billing responsibility belongs to the primary tenant.

### 6. Tenant And Contract

A tenant is a person/contact.

A contract is the rental agreement between a tenant and a unit. In the UI, this can be called `Contrato` or `Contrato / Acuerdo de renta`.

A formal legal contract is optional. The app still uses a contract record internally to track who rents what, how much they pay, and when rent is due.

Required contract fields:

- Tenant
- Unit
- Start date
- Monthly rent
- Payment day

Optional contract fields:

- End date
- Deposit
- Included services
- Tenant-paid services
- Notes
- Attachments

Example:

```text
Tenant: Ana Lopez
Unit: Cuarto 1
Contract:
  Start date: 2026-01-01
  End date: optional
  Monthly rent: 3500
  Deposit: 3500
  Payment day: 5
```

A tenant can have multiple contracts over time.

### 7. Tenant Profile

Tenant profile should be simple.

Required:

- Name
- Phone

Optional:

- Email
- City
- State
- Emergency contact
- Notes
- Documents

Full address is not required.

Tenant active/inactive status should be derived from active contracts, not manually edited.

### 8. Default Rent And Contract Rent

A unit can have an optional default rent amount.

The actual rent belongs to the contract.

When creating a contract:

- Pre-fill rent from the unit's default rent.
- Allow the user to edit it.
- Save the final amount on the contract.

Reason:

- Similar rooms often share the same price.
- Real life still has exceptions, discounts, increases, or negotiated prices.
- Historical contracts must keep the rent amount agreed at that time.

### 9. Monthly Rent Charges

A contract defines the rent agreement.

Monthly rent charges represent what is expected for each month.

Example:

```text
Contract:
  Monthly rent: 3500
  Payment day: 5

Rent charges:
  June 2026: 3500 due June 5 - paid
  July 2026: 3500 due July 5 - pending
```

Initial implementation:

- Generate one monthly rent charge per active contract.
- Trigger generation when relevant pages load, such as dashboard or payments.
- Do not use scheduled jobs at first.
- Do not create duplicate charges.
- Do not add late fees at first.

### 10. Payments

Each payment belongs to one specific monthly rent charge.

A rent charge can have multiple payments.

Payment status is calculated from payments, not manually typed.

Statuses:

- Pending
- Partial
- Paid
- Overdue

Payment methods should use a fixed list plus notes:

- Cash
- Bank transfer
- Deposit
- Applied deposit
- Other

UI labels should be Spanish:

- Efectivo
- Transferencia
- Depósito
- Depósito aplicado
- Otro

### 11. Payment Attachments

Payments can have optional attachments, such as transfer screenshots or receipt photos.

Storage pattern:

- File binary: Cloudinary in deployed environments.
- File metadata: PostgreSQL.

Recommended metadata:

- paymentId
- url
- publicId
- originalFileName
- mimeType
- size
- uploadedAt

Local uploads may be used during early development, but production/demo uploads should use Cloudinary because Render Free filesystem is temporary.

### 12. Deposit

Deposit is important and should be tracked on the contract.

Simple fields:

- depositAmount
- depositStatus
- depositNotes

Deposit statuses:

- Pending
- Paid
- Applied
- Returned
- Retained

If a deposit is used for the last month, create a payment with method `Applied deposit` and update the deposit status to `Applied`.

### 13. Expenses

Expenses belong to a property and may optionally belong to a specific unit.

Example:

```text
Expense:
  Property: Casa Chapultepec
  Unit: Cuarto 2
  Category: Repair
  Amount: 850
```

Expenses can have attachments, such as receipts, invoices, or screenshots.

Expense categories should use a fixed list plus notes:

- Electricity
- Water
- Internet
- Maintenance
- Repair
- Cleaning
- Taxes
- Other

UI labels should be Spanish:

- Luz
- Agua
- Internet
- Mantenimiento
- Reparación
- Limpieza
- Impuestos
- Otro

### 14. Services

Expenses track bills paid by the landlord.

Contracts can record services as simple fields/notes:

- Included services
- Tenant-paid services
- Service notes

No automatic service billing in MVP.

Example:

```text
Included services: Agua, Internet
Tenant-paid services: Luz
Notes: Luz se divide entre los cuartos 1, 2 y 3
```

### 15. Contract Dates And Attachments

Contract end date is optional.

If an end date exists, the dashboard should be able to warn about contracts ending soon.

Contracts can have attachments:

- Signed contract PDF
- Word document
- Tenant ID
- Related documents

### 16. Dashboard And Reports

The MVP should focus on useful in-app reports before exports.

Initial dashboard/report widgets:

- Rent collected this month
- Pending and overdue rent
- Monthly expenses
- Net balance: collected minus expenses
- Available and occupied units
- Contracts ending soon

### 17. Search And Filtering

Search and filtering are first-class features.

Examples:

- Search tenant by name or phone.
- Filter payments by month/status.
- Filter expenses by property/category.
- Filter units by available/occupied.

This supports real usage and interview practice for debounce, pagination, filtering, and table state.

### 18. WhatsApp

The MVP supports only one-click WhatsApp contact for a single tenant using their phone number.

No group chats, no bulk sending, and no automatic WhatsApp API.

### 19. Mexico Defaults

The MVP uses Mexico defaults:

- Currency: MXN
- Locale: es-MX
- UI copy: Spanish LATAM
- Phone handling: Mexico-style phone numbers

No multi-currency in MVP.

### 20. Soft Delete And History

Do not hard-delete business records from the UI.

Use archive/deactivate/cancel/status fields for:

- Property
- Unit
- Tenant
- Contract
- RentCharge
- Payment
- Expense
- Attachment metadata

Keep history by default. No automatic yearly cleanup in MVP.

### 21. Audit Trail

No full audit log in MVP.

Use basic timestamps and user tracking:

- createdAt
- updatedAt
- createdById
- updatedById

### 22. Mobile Usage

Desktop/tablet can be best for full management, but mobile must be strong for daily actions.

Mobile-priority flows:

- View dashboard summary
- See overdue/pending rents
- Record payment
- Upload receipt photo
- Contact tenant on WhatsApp
- View tenant/unit details
- Record quick expense

Desktop-priority flows:

- Initial setup
- Properties/units management
- Reports
- Large tables
- Settings

## Deferred Or Out Of Scope

These are intentionally not part of the first MVP:

- Stripe or paid subscriptions.
- Tenant portal.
- Public marketing landing page.
- Real WhatsApp Business API integration.
- Bulk WhatsApp messages.
- WhatsApp group messaging.
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
- CSV exports in early MVP.
- PDF reports in early MVP.
- XLSX exports until in-app reports are useful.
- Custom domain.
- Docker.
