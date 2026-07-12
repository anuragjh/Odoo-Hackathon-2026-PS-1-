# Asset Registration & Directory Module

Internal module of `java-main-backend`. Maintains the master record of every physical
asset: registration, directory (search/filter/sort/paginate), detail view, edits, status
transitions, documents, and a per-asset timeline. It does NOT allocate, transfer, book,
maintain, or audit assets - those are later modules.

## Layout

```
asset/
├── controller/   AssetController (base path /api/v1/admin/assets)
├── service/      AssetService
├── repository/   AssetRepository, AssetDocumentRepository, AssetEventRepository
├── dto/          request/response records
└── entity/       Asset, AssetDocument, AssetEvent (+ enums AssetStatus, AssetCondition)
```

## Integration

- Reuses the organisation-setup module's `AuthPrincipal`, `ApiResponse`, `PageResponse`,
  `PageableFactory`, exceptions, and the `AssetCategoryRepository` / `DepartmentRepository`.
- Endpoints live under `/api/v1/admin/assets`, so the org-setup `SecurityFilterChain`
  (`securityMatcher("/api/v1/admin/**")`) secures them and `AuthPrincipal` is available.
- Schema is created by Flyway migration `V2__asset_registration.sql` (tables `assets`,
  `asset_documents`, `asset_events`; enums `asset_status`, `asset_condition`; sequence
  `asset_tag_seq`).

## Endpoints

| Method | Path | Roles |
| --- | --- | --- |
| POST | `/api/v1/admin/assets` | ADMIN, ASSET_MANAGER |
| GET | `/api/v1/admin/assets` | all authenticated |
| GET | `/api/v1/admin/assets/dashboard` | all authenticated |
| GET | `/api/v1/admin/assets/statistics` | all authenticated |
| GET | `/api/v1/admin/assets/{id}` | all authenticated |
| PUT | `/api/v1/admin/assets/{id}` | ADMIN, ASSET_MANAGER |
| PATCH | `/api/v1/admin/assets/{id}/status` | ADMIN, ASSET_MANAGER |
| POST | `/api/v1/admin/assets/{id}/documents` | ADMIN, ASSET_MANAGER |
| GET | `/api/v1/admin/assets/{id}/documents` | all authenticated |
| GET | `/api/v1/admin/assets/{id}/history` | all authenticated |

List query params: `search` (tag/name/serial), `categoryId`, `departmentId`, `status`,
`condition`, `location`, `shared`, `manufacturer`, `page`, `size`, `sortBy`
(`assetName`, `assetTag`, `acquisitionDate`, `acquisitionCost`, `createdAt`), `direction`.

## Rules enforced

- Asset tag auto-generated (`AF-000001` via `asset_tag_seq`), unique, never editable.
- Category and department must exist and be active; serial number unique per organisation.
- Acquisition cost cannot be negative; warranty expiry cannot precede the acquisition date.
- Status starts `AVAILABLE`; changes go through the status endpoint and are recorded on the
  timeline. Assets are never deleted - retire or dispose via a status change.
- Every register / update / status change / document add writes an `asset_events` row.
