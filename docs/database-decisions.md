# Database Decisions — AssetFlow

This file is for tracking all database-related decisions, assumptions, and reasoning made during development, for team and evaluator reference.

---

## Decision Log

### 1. ORM & Migration Tool: Prisma
- Chosen over raw SQL / other ORMs (Sequelize, TypeORM) for schema-as-code clarity, type-safe client generation, and fast migration workflow for the hackathon.
- `database/` is a standalone npm workspace, independent of `backend/` and `frontend/`, so DB work could start before backend was ready. Backend will consume the generated Prisma Client / schema once both are integrated.

### 2. Database Engine: PostgreSQL (local, via pgAdmin)
- Chosen for native ENUM types, range types + `EXCLUDE` constraints (needed later for booking-overlap prevention), and strong relational integrity for a heavily-relational schema.
- Local instance used instead of cloud DB to avoid third-party/network dependency.

### 3. Primary Keys: UUID (not auto-increment integers)
- All tables use `id String @id @default(uuid())`.
- Reason: avoids sequential-ID guessing/enumeration issues, and avoids ID collisions if any data needs merging across environments during the hackathon.

### 4. `User` model — initial design
- Fields: `id, name, email (unique), passwordHash, role (enum), departmentId, status (enum), createdAt, updatedAt`.
- `role` enum: `admin | asset_manager | department_head | employee`, defaults to `employee`.
- **Business rule enforced by design:** no `role` field is exposed on the public signup flow (handled at API layer later) — only Admins can promote a user's role. This is to satisfy the PS requirement: "Signup creates an Employee account only, no role selection at signup."

### 5. `Department` model — initial design
- Fields: `id, name (unique), code (unique), headUserId, parentDepartmentId (self-referential, for hierarchy), status (enum), createdAt, updatedAt`.
- Self-referential `parentDepartmentId` supports optional department hierarchy per PS ("optional Parent Department (for hierarchy)").

### 6. Deferred: `Department.headUserId` as a formal Prisma relation
- **Assumption/decision, not yet finalized:** `headUserId` is currently a plain `String?` field, NOT wired as a Prisma `@relation` to `User`.
- Reason: `User.departmentId → Department` and `Department.headUserId → User` together form a circular foreign-key relationship, which Prisma requires special handling for (e.g. explicit `onDelete` behavior) to avoid migration errors.
- **Action item:** revisit once both models are stable and confirm the correct circular-relation handling before final schema freeze.

### 7. Migration 1: `init_users_departments`
- Created `users` and `departments` tables via `npx prisma migrate dev --name init_users_departments`.
- Verified via Prisma Studio and pgAdmin.

### 8. Schema Reconciliation — Adopted Backend's Multi-Tenant Schema as Base
- Decision: adopted this as the new base for `database/prisma/schema.prisma` (single source of truth), deleted the duplicate `Backend/prisma/` folder (team-agreed).
- Changes made during reconciliation:
  - Added `@@map("snake_case")` to every model for consistent Postgres table naming.
  - Added `pgcrypto` to `datasource.extensions` (required for `gen_random_uuid()`, was missing).
  - Added `organizations.notification_channels` JSONB field (PRD §13.2 — future email/SMS toggle, cheap to include now).
  - Removed `datasource.url` from `schema.prisma` (Prisma 7 breaking change — connection URL now lives in `prisma.config.ts` only).

### 9. Multi-Tenancy Model: `organization_id` on every tenant-scoped table
- Single-schema multi-tenancy (shared tables + `organization_id` FK column), not separate databases per org.
- Uniqueness constraints scoped per-org via composite unique indexes: `[organization_id, email]` (users), `[organization_id, name/code]` (departments), `[organization_id, name]` (asset_categories), `[organization_id, asset_tag/serial_number/qr_code]` (assets), `[organization_id, idempotency_key]` (idempotency_keys).
- App-layer enforcement of org-scoping (every query filtered by `organization_id` from JWT) chosen over Postgres Row-Level Security for time reasons 

### 10. Migration 2: `multitenant_full_schema`
- Replaced the entire schema with the reconciled multi-tenant version. Applied cleanly with no data-loss reset needed (tables were still empty).
- Enabled Postgres extensions: `pgcrypto` (for `gen_random_uuid()` as the ID default across all tables) and `btree_gist` (required for the booking-overlap exclusion constraint, migration 3 below).

### 11. Migration 3: `booking_overlap_and_allocation_constraints` (raw SQL)
- Two business-critical constraints that Prisma's schema syntax cannot express natively, added via a hand-written raw-SQL migration:
  - `one_active_allocation_per_asset`: partial unique index on `allocations(asset_id) WHERE status = 'active'` — enforces (an asset can't be actively allocated twice) at the database level, not just app logic.
  - `no_overlapping_bookings`: Postgres `EXCLUDE USING gist` constraint on `bookings`, comparing `asset_id` equality against `tstzrange(start_time, end_time)` overlap, scoped to non-cancelled bookings — enforces exact example (9:00–10:00 booked → 9:30–10:30 rejected, 10:00–11:00 allowed).
- Both are DB-level guarantees, meaning even a backend bug or a bypassed API call cannot violate these two core business rules — the database itself is the last line of defense.

### 12. Deferred / Not Yet Implemented
- `idempotency_keys` table exists in schema, but the Express middleware that reads/writes it is a backend task, not a DB task — flagged for backend team.
- Postgres RLS for tenant isolation — deferred, app-layer filtering used instead (see #9 above).
- `Department.head_user_id` circular relation — now properly wired as a named relation (`"DepartmentHead"`) in the reconciled schema; earlier concern (decision #6, superseded) about circular-relation handling was resolved automatically by Prisma once both sides were defined together in one migration.