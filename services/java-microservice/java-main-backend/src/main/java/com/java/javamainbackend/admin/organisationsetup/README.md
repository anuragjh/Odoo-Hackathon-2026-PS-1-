# Admin — Organisation Setup Module

Internal module of `java-main-backend` (not a separate service). It manages the master data
the rest of AssetFlow depends on: departments, asset categories, the employee directory, and
organisation settings.

Authentication and organisation registration are handled elsewhere in `java-main-backend`.
This module only reads the authenticated principal; it does not create accounts.

## Layout

```
admin/organisationsetup/
├── controller/    REST endpoints (base path /api/v1/admin)
├── service/       business logic + AuditLogService
├── repository/    Spring Data JPA repositories
├── dto/           request/response records, grouped per feature
├── entity/        JPA entities + enums
├── common/        ApiResponse, PageResponse, PageableFactory, exceptions
├── security/      JWT filter, AuthPrincipal, JwtService
└── config/        scoped SecurityFilterChain, CORS, auth entry point
```

## Security

The module registers its own `SecurityFilterChain` scoped to `/api/v1/admin/**`
(`@Order(1)`), so it coexists with the authentication chain owned by the rest of the backend.
The chain is stateless and validates the shared JWT (`security.jwt.secret`); the token subject
is resolved against the `users` table and only `ACTIVE` accounts are authenticated. Write
operations require `ADMIN`; reads are open to `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`.

If the backend later introduces its own principal type, replace `security/JwtAuthenticationFilter`
and `security/AuthPrincipal` here with the shared ones and delete this chain.

## Configuration

Reads the shared `application.properties` keys: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`,
`JWT_SECRET`, `JWT_ISSUER`, `CORS_ALLOWED_ORIGINS`. Schema is applied from `doc/schema.sql`
(`ddl-auto=none`).

## Endpoints

Base path `/api/v1/admin`.

| Group | Path |
| --- | --- |
| Departments | `/departments` (+ `/{id}`, `/{id}/activate`, `/{id}/deactivate`, `/{id}/head`) |
| Asset Categories | `/asset-categories` (+ `/{id}`, `/{id}/activate`, `/{id}/deactivate`) |
| Employee Directory | `/employees` (+ `/{id}`, `/me`, `/statistics`, `/{id}/approve|reject|activate|suspend|unlock|role|department`) |
| Organisation | `/organization` |
| Dashboard | `/dashboard/organization-setup` |

All responses use the envelope `{ success, message, data, timestamp }`; list endpoints wrap
`data` in a page object.
