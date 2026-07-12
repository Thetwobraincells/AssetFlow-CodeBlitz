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