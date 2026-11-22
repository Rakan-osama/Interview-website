# Delivery architecture

The repository supports two local workflows:

- XAMPP remains the fastest Windows development path. Follow `START-HERE.md`.
- Docker Compose runs the production topology locally: PHP-FPM, Nginx, a queue worker, scheduler, MariaDB, and Redis.

## Local containers

Docker Desktop is required. It is not currently installed on the original development machine.

1. Copy `.env.docker.example` to `.env.docker`.
2. Generate an application key with `php platform/api/artisan key:generate --show` and store it as `APP_KEY`.
3. Set unique database passwords.
4. Run `docker compose up -d db redis`.
5. Run `docker compose --profile operations run --rm migrate`.
6. Run `docker compose up -d app web worker scheduler`.
7. Open `http://localhost:8080`.

The worker stops accepting new jobs on termination and receives a 90-second grace period. Jobs still need to be idempotent because a crash can happen after an external effect but before acknowledgment.

## Pull-request evidence

The CI workflow tests PHP 8.3 and 8.5 against MariaDB and MySQL, uses Redis for integration behavior, runs migrations and the curriculum audit, executes PHPUnit and frontend checks, builds the production image, starts the Compose topology, and probes `/up`. Every external action is pinned to an immutable commit SHA.

Dependency caches are performance aids only. Release identity comes from the container digest. The release workflow publishes one image to GHCR, attaches an SBOM and provenance, and exposes the digest for promotion.

## Protected deployment contract

Deployment is disabled until the protected `production` environment defines `DEPLOY_ENABLED=true`, requires an approval, and configures:

- `OIDC_AUDIENCE`: audience accepted by the deployment gateway.
- `OIDC_ROLE`: the narrowly scoped production role; the gateway validates this claim.
- `DEPLOY_TARGET`: HTTPS URL of the deployment gateway.
- `HEALTH_URL`: HTTPS endpoint whose response contains the running image digest.

The gateway must validate GitHub's OIDC signature, repository, workflow reference, protected environment, audience, and role claims. It then implements three authenticated operations:

- `POST /deployments` with `expand-and-deploy` applies only backward-compatible expand migrations and progressively deploys the supplied digest.
- `POST /deployments/finalize` reloads queue workers and applies a separately reviewed contract migration after health is proven.
- `POST /deployments` with `rollback` restores the supplied previous digest without trying to reverse a destructive migration.

No long-lived cloud credential is stored in GitHub. The workflow obtains a short-lived GitHub OIDC token only after environment approval. A provider-specific gateway can exchange it for AWS, Azure, or Google Cloud credentials while keeping the workflow's digest-promotion contract unchanged.
