# Interview Platform — start here

The new platform runs locally at **http://localhost:8080** with Laravel, React, XAMPP Apache and MariaDB.

## First setup

1. Start MySQL in the XAMPP Control Panel.
2. Open PowerShell as Administrator in this repository.
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-xampp.ps1
```

4. Restart Apache from the XAMPP Control Panel if it was already running.
5. Open http://localhost:8080.

The installer is idempotent. It creates `interview_platform`, creates the restricted `interview_app` database user, installs locked dependencies, migrates and seeds the curriculum, builds React, and validates Apache.

Run the queue worker in another terminal while developing:

```powershell
cd .\platform\api
C:\xampp\php\php.exe artisan queue:work --tries=3 --timeout=60
```

Create an administrator through the protected CLI command:

```powershell
cd .\platform\api
C:\xampp\php\php.exe artisan admin:create admin@example.com
```

## Development

```powershell
pnpm.cmd install --filter "@interview-platform/web..." --frozen-lockfile
pnpm.cmd --filter @interview-platform/web dev
cd platform\api
C:\xampp\php\php.exe artisan serve
```

The Vite server uses port 5174 and proxies `/api` and `/sanctum` to Laravel on port 8000.

## Verification

```powershell
node node_modules\typescript\bin\tsc -b platform\web\tsconfig.json --pretty false
cd platform\api
C:\xampp\php\php.exe vendor\phpunit\phpunit\phpunit
```

The production bundle is written to `platform/api/public/spa` and served by Laravel. Generated dependencies, builds, backups and environment files are ignored by Git.

See [architecture](docs/ARCHITECTURE.md) and the [migration/cleanup report](docs/CLEANUP-REPORT.md).
