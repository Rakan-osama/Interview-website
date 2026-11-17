# Interview Platform

A bilingual interview-preparation platform with 54 learning tracks, 350 exercises, 102 concepts and 16 feature-design guides.

- `platform/api`: Laravel REST API, Sanctum session authentication, MariaDB persistence, CMS revisions and queued assessment jobs.
- `platform/web`: React/Vite SPA with route-level lazy loading, offline mutation storage and feature modules.
- `scripts`: repeatable XAMPP setup and legacy-content export.
- `app`: preserved legacy application used as the migration source until remaining parity gates are complete.

Start with [START-HERE.md](START-HERE.md). Architecture decisions and dependency direction are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

The legacy implementation is intentionally retained until progress import, remaining parity tests and owner approval satisfy the removal gates. Do not delete it manually.
