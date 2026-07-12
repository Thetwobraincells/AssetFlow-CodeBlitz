# AssetFlow

**Enterprise Asset & Resource Management System**

AssetFlow is a centralized, ERP-style platform that lets any organization — offices, schools, hospitals, factories, agencies — track physical assets and shared resources: who holds what, where it is, and its condition. It replaces spreadsheets and paper logs with structured asset lifecycles, conflict-safe resource booking, and a maintenance/audit workflow with full traceability.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Set up PostgreSQL](#2-set-up-postgresql)
  - [3. Set up the database package (Prisma)](#3-set-up-the-database-package-prisma)
  - [4. Set up the Backend](#4-set-up-the-backend)
  - [5. Set up the Frontend](#5-set-up-the-frontend)
  - [6. Verify everything is running](#6-verify-everything-is-running)
- [Environment Variables](#environment-variables)
- [Seed Data / Demo Login](#seed-data--demo-login)
- [API Reference](#api-reference)
- [Business Rules Enforced](#business-rules-enforced)
- [Testing](#testing)
- [Team](#team)

---

## Overview

Any organization with equipment, furniture, vehicles, or shared spaces can use AssetFlow to:

- Maintain departments, asset categories, and an employee directory
- Track assets through a 7-state lifecycle (`Available → Allocated → Reserved → Under Maintenance → Lost → Retired → Disposed`)
- Allocate assets to employees/departments while preventing double-allocation
- Book shared/limited resources by time slot with overlap validation
- Route maintenance requests through an approval workflow before repairs start
- Run scheduled audit cycles with assigned auditors and auto-generated discrepancy reports
- Surface overdue returns, bookings, and maintenance activity through notifications and a KPI dashboard

The system is multi-tenant: every organization's data is isolated by an `organization_id` scoped at the application layer, so the same deployment can serve multiple independent organizations.

## Core Features

| Module | What it does |
|---|---|
| **Auth** | Employee-only signup (no self-assigned roles), JWT login, forgot/reset password, session validation |
| **Organization Setup** | Admin-only: department management (with optional hierarchy), asset category management, employee directory & role promotion |
| **Asset Registry** | Register assets with auto-generated Asset Tags (`AF-0001`), search/filter by tag, serial number, QR code, category, status, department, or location; per-asset allocation & maintenance history |
| **Allocation & Transfer** | Allocate assets to employees/departments; blocks double-allocation and offers a Transfer Request flow instead; return flow with condition check-in notes; auto-flags overdue returns |
| **Resource Booking** | Time-slot booking of shared/bookable resources with hard overlap prevention; upcoming/ongoing/completed/cancelled statuses |
| **Maintenance Management** | Raise → Approve/Reject → Assign Technician → In Progress → Resolved workflow; asset auto-flips to `Under Maintenance` on approval and back to `Available` on resolution |
| **Asset Audits** | Create audit cycles scoped by department/location and date range, assign auditors, verify assets (Verified/Missing/Damaged), auto-generate discrepancy reports, close cycle |
| **Reports & Analytics** | Utilization trends, maintenance frequency, idle/near-retirement assets, dashboard KPIs |
| **Notifications & Activity Log** | In-app notifications for assignments, approvals, bookings, transfers, overdue returns, audit discrepancies; full audit trail of who did what, when |

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manages departments, categories, audit cycles, and role assignment; views organization-wide analytics. Only place roles are granted. |
| **Asset Manager** | Registers/allocates assets; approves transfers, maintenance requests, and audit discrepancy resolution; approves returns & condition check-ins |
| **Department Head** | Views assets allocated to their department; approves allocation/transfer requests within the department; books shared resources on behalf of the department |
| **Employee** | Views assets allocated to them; books shared resources; raises maintenance requests; initiates return/transfer requests |

Signup always creates a plain **Employee** account — Admins promote employees to Department Head or Asset Manager from the Employee Directory. There is no self-elevation path.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express 5 | Fast to scaffold, parallel-friendly for a team, huge ecosystem |
| Frontend | React 19 + Vite + TypeScript | Fast dev server, component reuse across 10 screens |
| Database | PostgreSQL | Native ENUM types, range types + `EXCLUDE` constraints for booking-overlap prevention, strong relational integrity |
| ORM | Prisma 5 | Schema-as-code, type-safe client, fast migrations |
| Auth | JWT (stateless access tokens) | No session-store infra; role claims embedded for RBAC |
| Validation | Zod | Shared, declarative request validation |
| Styling | Tailwind CSS v4 | Fast, consistent styling without a shared design-system build-out |
| File uploads | Multer → local disk (`/uploads`), served statically | No external dependency; swappable for S3 later |
| Notifications | In-app only, DB-backed | Avoids email/SMS third-party dependency |
| Security middleware | Helmet, CORS, Morgan | Standard hardening + request logging |
| Testing | Jest + Supertest | Backend route/controller testing |

**Deliberately avoided:** Firebase, Supabase, MongoDB Atlas, or any BaaS/third-party API beyond what's unavoidable.

## Repository Structure

```
AssetFlow-CodeBlitz-main/
├── Backend/                     # Express API server
│   ├── src/
│   │   ├── app.js               # Express app: middleware + route mounting
│   │   ├── server.js            # Entry point: Prisma connect + app.listen
│   │   ├── config/env.js        # Zod-validated environment config
│   │   ├── controllers/         # Request handlers per module
│   │   ├── services/            # Business logic per module
│   │   ├── routes/v1/           # Versioned route definitions
│   │   ├── middlewares/         # auth, rbac, tenant, validate, upload, idempotency, error
│   │   ├── validations/         # Zod schemas per module
│   │   ├── utils/               # ApiError, asset tag generator
│   │   └── scripts/seed.js      # Backend-side seed helper
│   ├── tests/                   # Jest + Supertest suites
│   └── package.json
├── Frontend/                    # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── screens/             # One component per screen (Dashboard, AssetDirectory, ...)
│   │   ├── components/          # Modals, Sidebar, Topbar, shared UI
│   │   ├── layouts/AppShell.tsx # Authenticated app shell (nav + content)
│   │   ├── App.tsx              # Top-level view/route switch
│   │   └── main.tsx             # React entry point
│   └── package.json
├── database/                    # Standalone Prisma workspace (source of truth for schema)
│   ├── prisma/
│   │   ├── schema.prisma        # Full data model (multi-tenant)
│   │   ├── migrations/          # Versioned SQL migrations
│   │   └── seed.js              # Demo data seeding script
│   ├── prisma.config.ts
│   └── package.json
└── docs/
    └── database-decisions.md    # Decision log: schema/design rationale
```

The `database/` folder is Prisma's schema-as-code source of truth. It is a separate npm workspace from `Backend/`, but the Prisma Client it generates is output directly into `Backend/node_modules/.prisma/client` so the API server can `require('@prisma/client')` without duplicating the schema.

## Architecture

```
┌──────────────┐        HTTPS/JSON        ┌───────────────────┐        Prisma Client        ┌──────────────┐
│   Frontend   │ ───────────────────────► │   Backend (API)   │ ───────────────────────────► │  PostgreSQL  │
│ React + Vite │ ◄─────────────────────── │  Express + Prisma │ ◄─────────────────────────── │  (Postgres)  │
└──────────────┘                          └───────────────────┘                              └──────────────┘
                                                     │
                                                     ▼
                                            /uploads (local disk,
                                             served statically)
```

**Request pipeline (per protected route):**
`helmet → cors → express.json → morgan → authMiddleware (verify JWT) → tenantMiddleware (scope by organization_id) → rbacMiddleware (role check) → [idempotencyMiddleware where applicable] → validate (Zod) → controller → service → Prisma → Postgres`

All API routes are versioned under `/api/v1`.

## Data Model

Defined in `database/prisma/schema.prisma`. All primary keys are UUIDs (`gen_random_uuid()`), every tenant-scoped table carries an `organization_id` foreign key, and uniqueness constraints are scoped per-organization (e.g. `[organization_id, email]`, `[organization_id, asset_tag]`).

**Models:** `Organization`, `User`, `Department`, `AssetCategory`, `Asset`, `Allocation`, `TransferRequest`, `Booking`, `MaintenanceRequest`, `AuditCycle`, `AuditCycleAuditor`, `AuditItem`, `Notification`, `ActivityLog`, `IdempotencyKey`

**Key enums:**
- `Role`: admin, asset_manager, department_head, employee
- `AssetStatus`: available, allocated, reserved, under_maintenance, lost, retired, disposed
- `AssetCondition`: excellent, good, fair, poor
- `AllocationStatus`: active, returned
- `TransferStatus`, `BookingStatus`, `MaintenancePriority`, `MaintenanceStatus`, `AuditCycleStatus`, `AuditItemStatus`, `NotificationType`

**Database-level business-rule enforcement** (not just application logic):
- `one_active_allocation_per_asset` — a partial unique index on `allocations(asset_id) WHERE status = 'active'`, guaranteeing an asset can never be actively allocated twice, even if the API layer is bypassed.
- `no_overlapping_bookings` — a Postgres `EXCLUDE USING gist` constraint comparing `asset_id` equality against `tstzrange(start_time, end_time)` overlap on non-cancelled bookings, guaranteeing two bookings for the same resource can never overlap.

Both require the `pgcrypto` and `btree_gist` Postgres extensions, which are enabled by the migrations.

See `docs/database-decisions.md` for the full rationale/decision log behind the schema.

## Prerequisites

Install these before you begin:

- **Node.js** ≥ 18 (LTS recommended) and npm
- **PostgreSQL** ≥ 14, running locally or accessible via a connection string
  - The schema requires the `pgcrypto` and `btree_gist` extensions — most standard Postgres installs can enable these without extra setup (see below)
- **Git**
- A way to inspect the database is optional but useful: `psql`, pgAdmin, or Prisma Studio (bundled)

## Getting Started

Follow these steps in order — the database must exist and be migrated before the Backend can start, and the Backend must be running before the Frontend can call it.

### 1. Clone the repository

```bash
git clone https://github.com/Thetwobraincells/AssetFlow-CodeBlitz.git
cd AssetFlow-CodeBlitz
```

### 2. Set up PostgreSQL

Create a database named `assetflow` (or any name you prefer, as long as you reflect it in `DATABASE_URL` later):

```bash
# using psql
psql -U postgres -c "CREATE DATABASE assetflow;"
```

Enable the two required extensions (the migrations will also attempt this, but having a superuser create them up front avoids permission issues on some managed Postgres setups):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

### 3. Set up the database package (Prisma)

This is the schema source of truth and must be migrated first.

```bash
cd database
npm install

# Create your local env file
cp .env.example .env
```

Edit `database/.env` and set your real connection string:

```env
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@localhost:5432/assetflow?schema=public"
```

Run the migrations (creates all tables, enums, and the two raw-SQL constraints):

```bash
npx prisma migrate deploy
```

> Use `npx prisma migrate dev` instead if you intend to author new migrations locally.

Generate the Prisma Client (this outputs into `Backend/node_modules/.prisma/client` per the `generator` block in `schema.prisma`, so run this **after** `Backend/npm install` — see step 4 — or re-run it once the Backend's `node_modules` exists):

```bash
npx prisma generate
```

Seed demo data (organization, departments, categories, users, assets):

```bash
npx prisma db seed
```

### 4. Set up the Backend

```bash
cd ../Backend
npm install

# Create your local env file
cp .env.example .env   # if not present, create manually — see Environment Variables below
```

Edit `Backend/.env`:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@localhost:5432/assetflow?schema=public"
JWT_SECRET="replace-with-a-long-random-string"
```

If you generated the Prisma Client before running `npm install` here, regenerate it now so it lands in the right `node_modules`:

```bash
cd ../database && npx prisma generate && cd ../Backend
```

Start the API server:

```bash
npm run dev
```

You should see:

```
Database connected successfully
Server is running on port 3000
```

The API is now available at `http://localhost:3000/api/v1`.

### 5. Set up the Frontend

In a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in your browser.

### 6. Verify everything is running

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Content-Type: application/json"
# Expect a 401 Unauthorized (correct — you're not logged in yet), not a connection error
```

If that returns a JSON error response rather than a connection failure, the Backend and database are wired up correctly.

## Environment Variables

### `database/.env`

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Postgres connection string used by Prisma migrations/seed | `postgresql://postgres:pass@localhost:5432/assetflow?schema=public` |

### `Backend/.env`

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | Port the Express server listens on | No | `3000` |
| `DATABASE_URL` | Postgres connection string (same database as above) | **Yes** | — |
| `JWT_SECRET` | Secret used to sign/verify JWTs | **Yes** | — |

Environment variables are validated at startup via a Zod schema (`Backend/src/config/env.js`) — the server refuses to start if `DATABASE_URL` or `JWT_SECRET` are missing.

## Seed Data / Demo Login

Running `npx prisma db seed` (from `database/`) populates:

- One demo organization (`Acme Corp`)
- Departments (e.g. Information Technology, Human Resources)
- Asset categories, sample assets, and demo users across the four roles

Inspect `database/prisma/seed.js` for the exact records and credentials it creates, since these are meant to be adjusted per-team/per-demo rather than hardcoded here.

## API Reference

All routes are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>`; routes marked with a role list additionally require the caller to hold one of those roles.

### Auth (`/auth`)
| Method | Path | Access |
|---|---|---|
| POST | `/auth/signup` | Public — always creates an Employee |
| POST | `/auth/login` | Public |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |
| GET | `/auth/me` | Authenticated |

### Organization Setup (`/departments`, `/categories`, `/users`)
| Method | Path | Access |
|---|---|---|
| GET | `/departments` | Authenticated |
| POST / PATCH | `/departments`, `/departments/:id` | Admin |
| GET | `/categories` | Authenticated |
| POST / PATCH | `/categories`, `/categories/:id` | Admin |
| GET | `/users` | Admin |
| PATCH | `/users/:id/role` | Admin — the only way to promote a user |
| PATCH | `/users/:id/status` | Admin |

### Assets (`/assets`)
| Method | Path | Access |
|---|---|---|
| GET | `/assets`, `/assets/:id` | Authenticated (any tenant user) |
| POST | `/assets` (multipart, `image` field) | Admin, Asset Manager |
| PATCH | `/assets/:id` (multipart, `image` field) | Admin, Asset Manager |

### Allocations (`/allocations`)
| Method | Path | Access |
|---|---|---|
| POST | `/allocations` | Admin, Asset Manager — blocked if asset already actively allocated |
| POST | `/allocations/:id/return` | Admin, Asset Manager |
| POST | `/allocations/transfer` | Admin, Asset Manager |

### Bookings (`/bookings`)
| Method | Path | Access |
|---|---|---|
| GET | `/bookings` | Authenticated |
| POST | `/bookings` | Authenticated — rejected on time-slot overlap |
| DELETE | `/bookings/:id` | Authenticated |

### Maintenance (`/maintenance`)
| Method | Path | Access |
|---|---|---|
| GET | `/maintenance`, `/maintenance/:id` | Authenticated |
| POST | `/maintenance` | Authenticated — any user can raise a request |
| PATCH | `/maintenance/:id/status` | Admin, Asset Manager — approve/reject/assign/resolve |

### Audits (`/audits`)
| Method | Path | Access |
|---|---|---|
| GET | `/audits`, `/audits/:id` | Admin |
| POST | `/audits` | Admin |
| POST | `/audits/:id/close` | Admin |
| PATCH | `/audits/:cycleId/items/:itemId/verify` | Admin, Asset Manager |

### Notifications (`/notifications`)
| Method | Path | Access |
|---|---|---|
| GET | `/notifications` | Authenticated |
| PATCH | `/notifications/:id/read` | Authenticated |
| POST | `/notifications/read-all` | Authenticated |

### Reports (`/reports`)
| Method | Path | Access |
|---|---|---|
| GET | `/reports/kpis` | Admin, Department Head |
| GET | `/reports/utilization` | Admin, Department Head |
| GET | `/reports/maintenance-frequency` | Admin, Department Head |
| GET | `/reports/idle-assets` | Admin, Department Head |

Idempotency keys (`Idempotency-Key` header, checked via `idempotency.middleware.js`) are supported on allocation and booking write endpoints to make retried requests safe.

## Business Rules Enforced

- **No self-assigned admin roles.** Signup always creates a plain Employee; only an Admin can promote via the Employee Directory (`PATCH /users/:id/role`).
- **No double allocation.** Allocating an already-allocated asset is rejected at both the application layer and the database layer (`one_active_allocation_per_asset` partial unique index); the API is expected to surface a "currently held by X" message and route the caller to a transfer request instead.
- **No overlapping bookings.** A booking request that overlaps an existing non-cancelled booking for the same resource is rejected at both the application layer and the database layer (`no_overlapping_bookings` exclusion constraint). A booking that starts exactly when another ends is allowed.
- **Maintenance requires approval before work starts.** An asset only flips to `Under Maintenance` once an Asset Manager approves the request, and reverts to `Available` on resolution.
- **Audits are structured, not single forms.** Each audit cycle has assigned auditors, per-asset verification (Verified/Missing/Damaged), and closing the cycle locks it and updates affected asset statuses (e.g. `Lost` for confirmed-missing items).
- **Multi-tenant isolation.** Every tenant-scoped table carries `organization_id`; every query is filtered by the tenant ID resolved from the caller's JWT (`tenant.middleware.js`), not by a value the client can supply.
- **Acquisition Cost is reporting-only.** It is never referenced by any allocation, booking, or maintenance logic — purchasing/invoicing/accounting are explicitly out of scope.

## Testing

The Backend uses Jest + Supertest, with Prisma and bcrypt mocked so tests run without a live database:

```bash
cd Backend
npm test
```

Test suites live in `Backend/tests/` and cover: `auth`, `organization`, `maintenance`, `audit`, `notification`, and `report` flows.

## Team

This project was built by Team CodeBlitz
- For Odoo Hackathon 2026
