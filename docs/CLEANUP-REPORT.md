# Migration and cleanup report

Updated: 2026-11-22

## Verified curriculum state

| Record | Current | Status |
| --- | ---: | --- |
| Tracks | 63 | exact |
| Lessons | 432 | exact, unique legacy mapping retained |
| Canonical concepts | 184 | schema v3 |
| Competency hubs | 4 | 18, 27, 32, and 24 referenced lessons |
| Feature guides | 16 | preserved |
| Resources | 12 | preserved |
| Projects | 7 | three original and four competency capstones |

The curriculum audit verifies source metadata, direct claim-to-source links, rubric-to-claim links, unique diagram fingerprints, accessible captions, guided-answer depth, model-answer length, duplicate paragraphs, and a deterministic 100/100 score for every canonical answer.

## Learner-data preservation

- Existing ULIDs, slugs, legacy keys, accounts, attempts, drafts, assessments, and progress remain in place.
- Before migration, the live baseline was 2 users, 4 attempts, and 1 draft answer.
- After migration and live smoke testing, the baseline remains 2 users, 4 attempts, and 1 draft answer.
- The pre-migration SQL backup is `backups/interview_platform_before_competencies_20261122.sql`.
- The temporary live-smoke account and its cascading test records were removed after verification.

## Added delivery and operations assets

- Multi-stage PHP/React/Nginx `Dockerfile` and a Compose topology for MariaDB, Redis, PHP-FPM, Nginx, the queue worker, scheduler, and migrations.
- Pull-request CI across PHP 8.3/8.5 and MariaDB/MySQL, with Redis, PHPUnit, Pint, frontend checks, curriculum audit, container build, and smoke tests.
- Digest-based GHCR releases with SBOM and provenance attestation.
- Protected deployment workflow with OIDC integration points, health verification, worker reload, and rollback to the previous immutable digest.
- Dependency automation for Composer, pnpm, Docker base images, and GitHub Actions.

## Removed earlier

- Failed incomplete Laravel scaffold at the former `platform/api` path; replaced by the tested API previously staged as `platform/api2`.
- Stale generated Vite configuration and frontend build output.
- Laravel starter README and welcome route; replaced by project documentation and the SPA fallback.
- Recoverable generated caches and builds from the old Vinext/Cloudflare workflow.

These removals remain recoverable through Git history. Database recovery files are kept in the ignored `backups/` directory.

## Retained behind cleanup gates

- Root Vinext starter files and dependencies.
- `xampp-api`, `db`, `drizzle`, Worker/Sites integration files, and the legacy progress table.

They remain because the approved migration plan forbids deletion until static references, complete feature parity, legacy URL/progress coverage, a production cutover, and owner approval all pass. The Laravel/React application no longer depends on these paths for its verified curriculum and assessment flows.

## Current verification

- Curriculum audit: pass at 63 tracks, 432 lessons, 184 concepts, 4 competency hubs, and 7 projects.
- PHPUnit: 30 tests, 50,037 assertions, pass.
- Frontend lint, TypeScript, and Vitest: pass.
- Production frontend build: pass; initial JavaScript is 109.07 KB gzip.
- YAML parsing: all GitHub workflows and `compose.yaml` pass.
- Live MariaDB flow: registration, authenticated curriculum, queued assessment, 100/100 result, and dashboard progress pass.
- Live health endpoint and `/competencies` SPA route: pass on `http://127.0.0.1:8000`.
- Docker execution is not locally verified because Docker Desktop is not installed; the CI container-smoke job performs that gate.
- The external link command was affected by local DNS timeouts on its final run; the key official Git, Docker, GitHub, OWASP, Redis, and MySQL pages were independently reachable on 2026-11-22.
