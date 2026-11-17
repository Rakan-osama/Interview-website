# Migration and cleanup report

Updated: 2026-11-17

## Verified migration

| Record | Legacy | MariaDB | Status |
| --- | ---: | ---: | --- |
| Tracks | 54 | 54 | exact |
| Exercises/lessons | 350 | 350 | exact, unique `legacy_key` |
| Concepts | 102 | 102 | exact |
| Feature guides | 16 | 16 | exact |

The generated migration fixture is `platform/api/database/seeders/data/legacy-content.json`. PHPUnit verifies exact counts and repeatable idempotent imports.

## Removed now

- Failed incomplete Laravel scaffold at the former `platform/api` path; replaced by the tested API previously staged as `platform/api2`.
- Stale generated `platform/web/vite.config.js` and `vite.config.d.ts`.
- Stale `platform/web/dist` build output.
- Laravel starter README and welcome route; replaced with project documentation and SPA fallback.
- Recoverable generated caches/builds: root `.corepack`, `.next`, `.sites-runtime`, `.vinext`, `.wrangler`, `dist`, and nested `platform/web/.sites-runtime`.

These source-level removals are recoverable from Git tag `pre-laravel-rearchitecture-20261116`. Database recovery files are under the ignored `backups/` directory.

## Retained behind migration gates

- Root `app`, `components`, `hooks`, legacy dependencies and build scripts.
- `xampp-api`, `db`, `drizzle`, Worker/Sites integration files and old progress table.

They remain because progress claim/import and all feature-parity/E2E gates are not yet complete. Removing them now would violate the approved recovery plan. Static-reference, production-build, legacy-URL, progress and owner-approval gates must pass first.

## Local environment repair

The initial XAMPP setup found corrupt MariaDB Aria system tables. `columns_priv`, `procs_priv`, `tables_priv`, `time_zone_leap_second` and `db` were repaired after SQL and physical backups. A post-repair check reports all five tables healthy.

## Current verification

- React TypeScript build: pass.
- React production build: pass; initial JavaScript 104.44 KB gzip.
- PHPUnit: 9 tests, 43 assertions, pass (including assessment idempotency/polling, dashboard isolation and browser progress import).
- Generated OpenAPI TypeScript contract drift check: pass.
- HTTP smoke tests: `/up` 200, `/`, `/tracks` and `/progress` canonical routes 200; API returns 54 tracks and 102 concepts.
- Least-privilege MariaDB account: scoped only to `interview_platform`.
