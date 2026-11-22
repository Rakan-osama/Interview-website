# Interview Platform — Start Here

The application uses a Laravel API, a React/Vite SPA, and XAMPP MariaDB. The production React bundle is already built into Laravel, so Node.js does not need to run while you use the application.

## Recommended: run with `php artisan serve`

1. Start **MySQL** in the XAMPP Control Panel.
2. Open PowerShell in this repository.
3. Start Laravel:

```powershell
cd .\platform\api
C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

4. In a second PowerShell window, start the assessment queue worker:

```powershell
cd .\platform\api
C:\xampp\php\php.exe artisan queue:work --tries=3 --timeout=60
```

5. Open **http://127.0.0.1:8000**.

Yes, `php artisan serve` is supported. Keep both terminal windows open while using the application. Stop either process with `Ctrl+C`.

## First-time XAMPP installation

Use this only when dependencies, the database, or Apache have not been configured:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-xampp.ps1
```

The installer creates the least-privilege `interview_app` database user, installs locked dependencies, runs migrations and seeds, builds React, and configures XAMPP Apache on **http://localhost:8080**. Restart Apache after the installer finishes.

The installer is idempotent: it can be run again without duplicating curriculum records or replacing learner accounts and progress.

## Frontend development

Use this only when editing React code. Keep Laravel running on port 8000, then run:

```powershell
pnpm.cmd --filter @interview-platform/web dev
```

Open **http://127.0.0.1:5174**. Vite proxies `/api` and `/sanctum` to Laravel.

After frontend changes, rebuild the SPA served by Laravel:

```powershell
pnpm.cmd --filter @interview-platform/web build
```

## Useful commands

```powershell
# Create an administrator
cd .\platform\api
C:\xampp\php\php.exe artisan admin:create admin@example.com

# Run backend tests
C:\xampp\php\php.exe artisan test

# Validate curriculum counts, claims, sources, answers, and diagrams
C:\xampp\php\php.exe artisan curriculum:audit

# Run frontend tests and checks (from the repository root)
pnpm.cmd --filter @interview-platform/web test
pnpm.cmd --filter @interview-platform/web lint
pnpm.cmd --filter @interview-platform/web typecheck
```

## Docker and CI/CD

Docker Desktop is optional and is not currently installed on this machine. After installing it, copy `.env.docker.example` to `.env.docker`, set `APP_KEY` and unique database passwords, then run:

```powershell
docker compose up -d db redis
docker compose --profile operations run --rm migrate
docker compose up -d app web worker scheduler
```

Open **http://localhost:8080**. The GitHub Actions pipeline tests PHP 8.3/8.5, MariaDB/MySQL, Redis, PHPUnit, frontend checks, curriculum audits, the production container, and a Compose smoke test. See [docs/DELIVERY.md](docs/DELIVERY.md) for release digests, SBOM/provenance, OIDC, protected deployment, and rollback.

See [README.md](README.md), [the architecture guide](docs/ARCHITECTURE.md), and [the cleanup report](docs/CLEANUP-REPORT.md).
