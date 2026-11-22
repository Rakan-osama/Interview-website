# Interview Platform

An English-only interview-preparation platform containing 63 learning tracks, 432 lessons, 184 canonical concepts, 4 ordered competency hubs, 16 feature-design guides, 12 resources, and 7 applied projects.

The platform provides schema-v3 guided explanations, production scenarios, code examples, accessible semantic diagrams, claim-based assessment rubrics, persistent learner answers, and progress tracking. Competency hubs cover delivery engineering, caching and asynchronous work, secure backend engineering, and relational data engineering without copying lesson progress.

## Applications

- `platform/api`: Laravel REST API, Sanctum session authentication, MariaDB persistence, curriculum revisions, and queued assessments.
- `platform/web`: React/Vite SPA with route-level loading, offline mutation support, structured lesson pages, progress, projects, and CMS features.
- `scripts`: repeatable XAMPP setup, migration, validation, and content tools.
- `.github/workflows`: pinned, least-privilege CI, release, provenance, and protected deployment pipelines.
- `Dockerfile` and `compose.yaml`: production-style PHP-FPM, Nginx, MariaDB, Redis, queue-worker, and scheduler topology.
- `app`: preserved legacy migration source until every cleanup and rollback gate is approved.

For local setup and exact run commands, begin with [START-HERE.md](START-HERE.md). Architecture and dependency rules are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Learner accounts, answers, attempts, and progress are stored in MariaDB and remain available after signing in again. Authored curriculum and interface content use English and global left-to-right layout; learner-entered text remains unrestricted.

Run `php artisan curriculum:audit` from `platform/api` to enforce the exact curriculum counts, schema-v3 structure, 70-word guided answers, 250-450-word canonical answers, source-linked claims, rubric alignment, and unique accessible diagrams. Delivery and container operations are documented in [docs/DELIVERY.md](docs/DELIVERY.md).
