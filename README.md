# AssetFlow — Enterprise Asset & Resource Management System (Backend)

AssetFlow is a centralized ERP for tracking, allocating, and maintaining an organization's
physical assets and shared resources. Any organization with equipment, furniture, vehicles, or
shared spaces (offices, schools, hospitals, factories, agencies) can use it to replace
spreadsheets and paper logs with structured asset lifecycles, conflict-free allocation and
booking, approval-based maintenance, structured audits, notifications, and a KPI dashboard.

This repository is the **backend**. Frontend is not covered here.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Configuration (Environment Variables)](#configuration-environment-variables)
6. [Database & Migrations](#database--migrations)
7. [Running the Backend](#running-the-backend)
8. [Authentication & Security](#authentication--security)
9. [Email (Mailjet)](#email-mailjet)
10. [Media Uploads (Cloudinary)](#media-uploads-cloudinary)
11. [Response Format](#response-format)
12. [API Reference](#api-reference)
13. [Domain Model & Enums](#domain-model--enums)
14. [Business Rules Enforced](#business-rules-enforced)
15. [Notifications & Activity Logs](#notifications--activity-logs)
16. [Testing](#testing)

---

## Tech Stack

| Concern | Technology |
| --- | --- |
| Language / Runtime | Java 17 |
| Framework | Spring Boot 4.1 (Web MVC, Data JPA, Security, Validation, Actuator) |
| Database | PostgreSQL (enum types, JSONB, `btree_gist`, partial/unique indexes, triggers) |
| Migrations | Flyway (`V1`..`V7`) |
| Cache / ephemeral tokens | Redis (email-verification / password-reset tokens, cooldowns, account locks) |
| Auth | JWT (HS256, `io.jsonwebtoken` / jjwt 0.13) + BCrypt password hashing |
| Email | Mailjet transactional API (console-log fallback when unconfigured) |
| Media storage | Cloudinary (asset photos, documents, profile pictures) |
| Build | Maven (wrapper included: `./mvnw`) |

Base package: `com.java.javamainbackend`. Backend module lives at
`services/java-microservice/java-main-backend`.

---

## Architecture

The backend is a **single Spring Boot application** composed of independent, cohesive modules.
Everything shares one PostgreSQL database and one JWT so a single login works everywhere.

- **Authentication & Organization Registration** — accounts, login, email verification, password
  reset, refresh-token rotation, admin user management.
- **Organisation Setup** (`admin/organisationsetup`) — departments, asset categories, employee
  directory, organisation settings.
- **Asset Registration & Directory** (`asset`) — the master asset record + per-asset timeline.
- **Allocation & Transfer** (`allocation`) — who holds what, with conflict handling.
- **Resource Booking** (`booking`) — time-slot booking of shared resources, no overlaps.
- **Maintenance** (`maintenance`) — approval workflow before repairs, asset-status sync.
- **Asset Audit** (`audit`) — audit cycles, auditors, discrepancy reports.
- **Reports & Analytics** (`reports`) — read-only operational aggregates.
- **Notifications & Activity Logs** (`notification`) — per-user feed + admin audit trail.
- **Dashboard** (`dashboard`) — cross-module KPI snapshot.
- **Uploads** (`upload`) — Cloudinary media uploads.

### Security topology

Two Spring Security filter chains coexist:

- **`@Order(1)`** — scoped to `/api/v1/admin/**` (all the modules above). Stateless, validates
  the JWT, resolves the user and exposes an `AuthPrincipal`.
- **`@Order(2)`** — the authentication chain, covers `/auth/**` and everything else.

Both validate the **same** `JWT_SECRET`, so a token from `/auth/login` is accepted across all
modules.

---

## Project Structure

```text
services/java-microservice/java-main-backend/
├── pom.xml
├── .env.example                         # copy to .env and fill in
├── src/main/resources/
│   ├── application.properties           # env-driven config
│   └── db/migration/                    # Flyway migrations V1..V7
└── src/main/java/com/java/javamainbackend/
    ├── JavaMainBackendApplication.java
    ├── config/            SecurityConfig, AppProperties, AsyncConfig       (auth)
    ├── controller/        AuthController, AdminUserController              (auth)
    ├── service/           AuthService, EmailService, RedisTokenService, …  (auth)
    ├── security/          JwtService, UserPrincipal, JWT filter, …         (auth)
    ├── model/ repository/ dto/ exception/ util/                            (auth)
    │
    ├── admin/organisationsetup/    departments, categories, employees, org
    │   ├── controller/ service/ repository/ dto/ entity/
    │   ├── common/       ApiResponse, PageResponse, PageableFactory, exceptions
    │   ├── security/     AuthPrincipal, JwtService, JwtAuthenticationFilter
    │   └── config/       SecurityConfig (scoped chain), CORS, entry point
    ├── asset/            registration & directory (+ documents, events timeline)
    ├── allocation/       allocation + transfer
    ├── booking/          resource booking
    ├── maintenance/      maintenance workflow
    ├── audit/            audit cycles / auditors / items
    ├── reports/          analytics (native aggregate queries)
    ├── notification/     notifications + activity logs
    ├── dashboard/        cross-module KPI overview
    └── upload/           Cloudinary config + upload endpoints
```

Each module follows the same layered layout: `controller / service / repository / dto / entity`.
Modules reuse the org-setup `common` helpers (`ApiResponse`, `PageResponse`, exceptions) and
`AuthPrincipal` so responses and error handling are consistent.

---

## Prerequisites

- **JDK 17** (the build targets Java 17).
- **PostgreSQL** 14+.
- **Redis** 6+.
- A **Cloudinary** account (for uploads) and optionally a **Mailjet** account (for real email).
- Docker is handy for spinning up Postgres/Redis locally (see below).

---

## Configuration (Environment Variables)

Configuration is fully environment-driven. `application.properties` reads env vars and also
imports an optional `.env` file from the working directory
(`spring.config.import=optional:file:.env[.properties]`), so you can keep secrets in `.env`.

Copy the template and fill it in:

```bash
cd services/java-microservice/java-main-backend
cp .env.example .env
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `SERVER_PORT` | HTTP port | `8080` |
| `DATABASE_URL` | JDBC URL (`jdbc:postgresql://host/db?sslmode=require`) | local Postgres |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | DB credentials | `postgres` / `postgres` |
| `DB_POOL_SIZE` | Hikari max pool size | `10` |
| `REDIS_HOST` / `REDIS_PORT` | Redis host/port | — / `6379` |
| `REDIS_USERNAME` / `REDIS_PASSWORD` | Redis auth | `default` / — |
| `REDIS_SSL` | TLS to Redis (Upstash = `true`) | `true` |
| `JWT_SECRET` | HMAC signing secret (**min 32 chars**) | dev placeholder |
| `JWT_ISSUER` | Token issuer claim | `assetflow-auth` |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | Access-token TTL | `900000` (15 min) |
| `REFRESH_TOKEN_EXPIRATION_DAYS` | Refresh-token TTL | `7` |
| `mailjet.api-key` / `mailjet.secret-key` | Mailjet API creds (blank = console mode) | blank |
| `mailjet.sender-email` / `mailjet.sender-name` | Verified sender | blank / `AssetFlow` |
| `cloudinary.url` | Cloudinary URL `cloudinary://key:secret@cloud` | blank |
| `MAX_FAILED_LOGIN_ATTEMPTS` | Lock threshold | `5` |
| `ACCOUNT_LOCK_DURATION_MINUTES` | Auto-unlock window | `30` |
| `VERIFICATION_TOKEN_TTL_HOURS` | Email-verify token TTL | `24` |
| `RESET_TOKEN_TTL_MINUTES` | Password-reset token TTL | `30` |
| `RESEND_COOLDOWN_SECONDS` | Resend/forgot rate limit | `60` |
| `FRONTEND_URL` | Used to build email links | `http://localhost:3000` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://localhost:5173` |

Generate a strong JWT secret with `openssl rand -base64 64`.

Cloudinary accepts **either** the single `cloudinary.url` **or** the split values
`cloudinary.cloud-name` / `cloudinary.api-key` / `cloudinary.api-secret` (also honored via
`CLOUDINARY_URL` / `CLOUDINARY_CLOUD_NAME` / … OS env vars).

---

## Database & Migrations

Schema is managed by **Flyway** and applied automatically at startup
(`spring.jpa.hibernate.ddl-auto=none` — Hibernate never touches DDL). Migrations live in
`src/main/resources/db/migration/`:

| Version | Adds |
| --- | --- |
| `V1__init_auth_schema` | `organizations`, `users`, `departments`, `asset_categories`, `refresh_tokens`, `audit_logs`; enums `role_type`, `account_status`; `set_updated_at()` trigger fn |
| `V2__asset_registration` | `assets`, `asset_documents`, `asset_events`; enums `asset_status`, `asset_condition`; `asset_tag_seq` |
| `V3__asset_allocation` | `asset_allocations`, `transfer_requests`; enums `allocation_status`, `transfer_status`; one-active-allocation unique index |
| `V4__notifications` | `notifications` |
| `V5__resource_booking` | `bookings`; enum `booking_status`; `btree_gist` no-overlap EXCLUDE constraint |
| `V6__maintenance` | `maintenance_requests`; enums `maintenance_priority`, `maintenance_status` |
| `V7__asset_audit` | `audit_cycles`, `audit_cycle_auditors`, `audit_items`; enums `audit_cycle_status`, `audit_result` |

Notable database-level guarantees:

- **One active allocation per asset** — partial unique index on `asset_allocations(asset_id) WHERE status = 'ACTIVE'`.
- **No overlapping bookings** — `EXCLUDE USING gist (resource_id WITH =, tstzrange(start_time, end_time) WITH &&) WHERE status <> 'CANCELLED'`.
- **Per-organization uniqueness** — case-insensitive unique indexes for department/category names & codes, unique asset serial numbers.
- Auto-updated `updated_at` via triggers; sane foreign keys with `ON DELETE` semantics.

---

## Running the Backend

### 1. Start Postgres & Redis (Docker, for local dev)

```bash
docker run -d --name assetflow-pg   -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=assetflow -p 5432:5432 postgres:16
docker run -d --name assetflow-redis -p 6379:6379 redis:7
```

Then set in `.env` (local, no TLS):

```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/assetflow
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_SSL=false
REDIS_PASSWORD=
JWT_SECRET=<run: openssl rand -base64 64>
cloudinary.url=cloudinary://<key>:<secret>@<cloud>
```

### 2. Run

```bash
cd services/java-microservice/java-main-backend

# dev (hot run)
./mvnw spring-boot:run

# or build a jar and run it
./mvnw -DskipTests clean package
java -jar target/java-main-backend-0.0.1-SNAPSHOT.jar
```

Flyway applies `V1..V7` on first boot. Health check: `GET http://localhost:8080/actuator/health`.

> Build note: use **JDK 17**. If an IDE recompiles `target/classes` with a newer JDK, do a clean
> build (`./mvnw clean package`) to avoid `UnsupportedClassVersionError`.

---

## Authentication & Security

### Account lifecycle

```text
register-organization → creates Organization + ADMIN (ACTIVE, email unverified)
signup                → creates EMPLOYEE (PENDING_APPROVAL, email unverified)
verify-email          → flips email_verified (single-use Redis token)
admin approves        → PENDING_APPROVAL → ACTIVE (Employee Directory)
login                 → verified? active? password? → access JWT + refresh token
refresh               → rotating refresh tokens with reuse detection
forgot/reset password → single-use Redis reset token, revokes all sessions
```

- **No self-elevation** — signup always creates a plain `EMPLOYEE`. Roles are granted only by an
  admin from the Employee Directory.
- **Passwords** are BCrypt-hashed (strength 12). Access tokens are stateless JWTs; refresh tokens
  are persisted and rotated.
- **Account protection** — configurable failed-login lockout with auto-unlock (Redis TTL), plus
  admin unlock/suspend/activate.
- **Roles**: `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`. Endpoints enforce roles via
  `@PreAuthorize`; module writes are ADMIN/ASSET_MANAGER, reads are broader, and every
  authenticated user can manage their own profile.
- **Multi-tenant isolation** — every module query is scoped to the caller's `organizationId`.
- **CORS** — configured from `CORS_ALLOWED_ORIGINS`.

All `/api/v1/admin/**` requests require `Authorization: Bearer <accessToken>`.

---

## Email (Mailjet)

Transactional emails (verification, password reset, account approved) are sent via the Mailjet
REST API, asynchronously.

- **Configured** (`mailjet.*` set): real emails are delivered.
- **Not configured** (blank): the email body/link is **logged to the console** instead — handy
  for local development and automated testing.

Link TTLs and resend cooldowns are configurable (see env table).

---

## Media Uploads (Cloudinary)

Files (asset photos, documents, profile pictures) are uploaded to Cloudinary; the app stores only
the returned secure URL on the relevant record.

| Method | Path | Body | Roles |
| --- | --- | --- | --- |
| POST | `/api/v1/admin/uploads/image` | multipart `file` | any authenticated |
| POST | `/api/v1/admin/uploads/document` | multipart `file` | any authenticated |
| POST | `/api/v1/admin/uploads/profile` | multipart `file` | any authenticated |

Response `data`: `{ url, publicId, resourceType }`. Clients then submit the `url` in the relevant
create/update payload (`photoUrl`, `profileImageUrl`, document `documentUrl`). If Cloudinary is not
configured the endpoints return a clear "uploads are not configured" error.

---

## Response Format

Every module endpoint returns a consistent envelope:

```json
{ "success": true, "message": "OK", "data": { }, "timestamp": "2026-01-01T00:00:00Z" }
```

List endpoints wrap `data` in a page object:

```json
{ "content": [ ], "page": 0, "size": 20, "totalElements": 42, "totalPages": 3, "first": true, "last": false }
```

Errors carry `success:false` with a message (and `data` field errors for validation). HTTP status
codes: `400` validation/bad state, `401` unauthenticated, `403` forbidden, `404` not found,
`409` conflict (uniqueness / double-allocation / booking overlap).

Common list query params: `search`, `page`, `size`, `sortBy`, `direction` (`asc`/`desc`), plus
per-module filters.

---

## API Reference

Base URL: `http://localhost:8080`. Auth endpoints are under `/auth`; all modules under
`/api/v1/admin`.

### Authentication — `/auth`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/register-organization` | Creates org + admin. **Org code is auto-generated** (returned at `data.organization.organizationCode`); do not send it. |
| POST | `/auth/signup` | Employee self-signup (needs `organizationCode`) |
| POST | `/auth/verify-email` | Body `{ token }` (also `GET /auth/verify-email?token=`) |
| POST | `/auth/resend-verification` | Body `{ email }` |
| POST | `/auth/login` | `{ email, password }` → `{ accessToken, refreshToken, tokenType, expiresInMs, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` → new token pair |
| POST | `/auth/logout` | `{ refreshToken }` |
| POST | `/auth/forgot-password` | `{ email }` (always 200) |
| POST | `/auth/reset-password` | `{ token, newPassword }` |
| GET | `/auth/me` | Current user (authenticated) |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` (revokes sessions) |

### Organisation Setup — `/api/v1/admin`

| Group | Endpoints | Roles |
| --- | --- | --- |
| Departments | GET/POST `/departments` · GET/PUT `/departments/{id}` · PATCH `/departments/{id}/activate`\|`/deactivate` · PUT/DELETE `/departments/{id}/head` | read: ADMIN/AM/DH · write: ADMIN |
| Categories | GET/POST `/asset-categories` · GET/PUT `/asset-categories/{id}` · PATCH `/{id}/activate`\|`/deactivate` | read: ADMIN/AM/DH · write: ADMIN |
| Employees | GET `/employees` · `/employees/{id}` · `/employees/statistics` · `/employees/me` (+ PATCH) | read: ADMIN/AM/DH; self: any |
| Employee actions | PATCH `/employees/{id}/approve`\|`/reject`\|`/activate`\|`/suspend`\|`/unlock`\|`/role` · PUT/DELETE `/employees/{id}/department` · PUT `/employees/{id}` | ADMIN |
| Organisation | GET/PUT `/organization` | read: ADMIN/AM/DH · write: ADMIN |
| Dashboard | GET `/dashboard/organization-setup` | ADMIN |

(AM = ASSET_MANAGER, DH = DEPARTMENT_HEAD.)

### Assets — `/api/v1/admin/assets`

`POST /` (register) · `GET /` (search + filter + sort) · `GET /{id}` · `PUT /{id}` ·
`GET /dashboard` · `GET /statistics` · `POST|GET /{id}/documents` · `GET /{id}/history`.
Filters: `search` (tag/name/serial), `categoryId`, `departmentId`, `status`, `condition`,
`location`, `shared`, `manufacturer`. Writes: ADMIN/ASSET_MANAGER; reads: all authenticated.
Asset tag (`AF-000001`) is auto-generated and immutable.

### Allocation & Transfer — `/api/v1/admin`

`POST /allocations` · `GET /allocations` · `GET /allocations/{id}` · `GET /allocations/dashboard` ·
`POST /allocations/{id}/return` · `POST /transfers` · `POST /transfers/{id}/approve` ·
`POST /transfers/{id}/reject`. Double-allocation is blocked with `409`. Writes ADMIN/ASSET_MANAGER;
transfer requests can be raised by any authenticated user; approvals by ADMIN/ASSET_MANAGER/DEPARTMENT_HEAD.

### Resource Booking — `/api/v1/admin/bookings`

`POST /` · `GET /` · `GET /{id}` · `PUT /{id}/reschedule` · `POST /{id}/cancel` ·
`GET /active-count`. Overlapping time slots on the same resource are rejected with `409`.
Any authenticated user can book; owners (or ADMIN/ASSET_MANAGER) can cancel/reschedule.

### Maintenance — `/api/v1/admin/maintenance`

`POST /` (raise) · `GET /` · `GET /{id}` · `GET /dashboard` · `PATCH /{id}/approve`\|`/reject`\|
`/assign-technician`\|`/start`\|`/resolve`. Workflow: `PENDING → APPROVED/REJECTED →
TECHNICIAN_ASSIGNED → IN_PROGRESS → RESOLVED`. Approval sets the asset to `UNDER_MAINTENANCE`;
resolution returns it to `AVAILABLE`. Raise: any authenticated; workflow: ADMIN/ASSET_MANAGER.

### Asset Audit — `/api/v1/admin/audit-cycles`

`POST /` (create; auto-generates items for the scope) · `GET /` · `GET /{id}` ·
`POST /{id}/auditors` · `DELETE /{id}/auditors/{userId}` · `GET /{id}/items` ·
`PATCH /{id}/items/{itemId}` (mark Verified/Missing/Damaged) · `GET /{id}/discrepancies` ·
`POST /{id}/close`. Closing locks the cycle and updates assets (Missing → `LOST`, Damaged →
condition `DAMAGED`). Create/assign/close: ADMIN; marking: assigned auditor or ADMIN/ASSET_MANAGER.

### Reports — `/api/v1/admin/reports`

`GET` `/assets-by-status` · `/assets-by-category` · `/most-used-assets` · `/idle-assets` ·
`/maintenance-by-category` · `/department-allocation` · `/warranty-expiring` · `/booking-heatmap`.
Roles: ADMIN/ASSET_MANAGER/DEPARTMENT_HEAD.

### Notifications & Activity Logs — `/api/v1/admin`

`GET /notifications` · `GET /notifications/unread-count` · `PATCH /notifications/{id}/read` ·
`PATCH /notifications/read-all` (own feed, any authenticated) · `GET /activity-logs`
(ADMIN/ASSET_MANAGER).

### Dashboard — `/api/v1/admin/dashboard/overview`

One call returns all KPI cards: total/available/allocated/reserved/under-maintenance assets,
maintenance-today, active bookings, pending transfers, upcoming returns, due-today, overdue returns.

---

## Domain Model & Enums

- **Role**: `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`
- **AccountStatus**: `PENDING_APPROVAL`, `ACTIVE`, `INACTIVE`, `LOCKED`, `SUSPENDED`, `REJECTED`
- **AssetStatus**: `AVAILABLE`, `ALLOCATED`, `RESERVED`, `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, `DISPOSED`
- **AssetCondition**: `EXCELLENT`, `GOOD`, `FAIR`, `DAMAGED`
- **AllocationStatus**: `ACTIVE`, `RETURNED`, `OVERDUE` (overdue is derived from the expected return date)
- **TransferStatus**: `PENDING`, `APPROVED`, `REJECTED`
- **BookingStatus**: `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`
- **MaintenancePriority**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **MaintenanceStatus**: `PENDING`, `APPROVED`, `REJECTED`, `TECHNICIAN_ASSIGNED`, `IN_PROGRESS`, `RESOLVED`
- **AuditCycleStatus**: `PLANNED`, `IN_PROGRESS`, `CLOSED`
- **AuditResult**: `PENDING`, `VERIFIED`, `MISSING`, `DAMAGED`

---

## Business Rules Enforced

- Signup creates only `EMPLOYEE`; roles are assigned solely by an admin.
- Department/category names & codes are unique per organisation; departments cannot be their own
  parent and hierarchy cycles are rejected; a department can't be deactivated while active
  employees are assigned.
- Assets start `AVAILABLE`; the asset tag is auto-generated and never editable; cost cannot be
  negative; warranty cannot precede the acquisition date; assets are never deleted (retire/dispose).
- An asset can have exactly **one active holder** — a second allocation is blocked (`409`) with a
  prompt to raise a transfer instead. Transfers close the old allocation and open a new one without
  the asset ever going Available. Overdue allocations are flagged automatically.
- Shared resources can be booked in **non-overlapping** time slots only (DB-enforced).
- Maintenance must be **approved before work begins**, and drives the asset status.
- Audit cycles generate per-asset items, produce discrepancy reports, and on close update affected
  asset statuses.
- Every mutating action is recorded (asset timeline events and/or `audit_logs`), and relevant
  actors receive notifications.

---

## Notifications & Activity Logs

- **Notifications** are per-user and generated on key events: asset assigned, return confirmed,
  transfer requested/approved, maintenance approved/rejected/resolved, booking confirmed/cancelled,
  audit assignment, audit cycle closed. Users read their own feed and mark items read.
- **Activity logs** (`audit_logs`) capture admin/manager actions (who did what, when) for
  administrators.

---

## Testing

The full backend has been exercised end-to-end (every endpoint, twice) against a live
PostgreSQL + Redis + Cloudinary + Mailjet stack — authentication and email flows, all CRUD and
workflow modules, conflict rules (double-allocation → 409, booking overlap → 409), reports,
notifications, dashboard, and uploads.

For local smoke testing, run Postgres/Redis via Docker (above), start the app, then:

1. `POST /auth/register-organization` (omit the org code — it's generated).
2. Read the verification link from the console log (Mailjet unconfigured) and `POST /auth/verify-email`.
3. `POST /auth/login` to obtain a Bearer token.
4. Call any `/api/v1/admin/**` endpoint with `Authorization: Bearer <token>`.

When Mailjet is unconfigured the verification/reset links are printed to the console, which makes
scripting the auth flow straightforward.
