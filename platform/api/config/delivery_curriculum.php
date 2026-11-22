<?php

return [
    [
        'key' => 'git-objects-history', 'title' => 'Git Objects, Staging, and Recoverable History',
        'summary' => 'Git records immutable snapshots as content-addressed objects. The staging index selects the next snapshot, branch names point to commits, and reflogs preserve recent reference movement so most local mistakes remain recoverable.',
        'definition' => 'A commit stores metadata plus a pointer to a tree; trees reference blobs and other trees. The index sits between the working tree and the repository. Reset moves references or index state, while revert creates a new inverse commit.',
        'scenario' => 'A 14-developer team accidentally resets a release branch after two approved fixes. The repository is protected, the commits existed locally, and recovery must not rewrite history already fetched by other developers.',
        'question' => 'Explain how Git stores a change from working tree to commit, then choose a safe recovery method for an accidentally moved shared branch and justify why it preserves collaboration.',
        'mechanism' => ['Hash file content into blob objects', 'Build tree objects from the staging index', 'Create a commit pointing to the root tree and parent commit', 'Move a branch reference while recording its previous value in the reflog'],
        'use' => 'Use the index to review the exact patch that will become one logical commit; use revert on shared history and reflog plus a new branch when recovering unreachable local commits.',
        'avoid' => 'Do not force-push a rewritten shared branch merely to make history look tidy. Coordinate exceptional rewrites and prefer a visible corrective commit.',
        'failure' => ['cause' => 'A destructive reset followed by garbage collection removes the last reachable reference.', 'symptom' => 'The branch no longer contains approved commits and normal log output cannot find them.', 'prevention' => 'Protect shared branches, review staged changes, and create tags for releases.', 'recovery' => 'Inspect reflog entries, create a recovery branch at the correct commit, then revert or merge safely.', 'monitoring' => 'Audit protected-branch changes and failed force-push attempts.'],
        'language' => 'shell', 'code' => "git status\ngit diff --staged\ngit reflog --date=iso\ngit branch recovery/release <commit-sha>\ngit revert <bad-commit-sha>",
        'sources' => ['git-book', 'github-actions-security'], 'visual' => 'state-machine',
        'claims' => [['Git object model', ['blob', 'tree', 'commit']], ['Index boundary', ['index', 'staging']], ['Shared recovery', ['revert', 'shared history']], ['Local recovery', ['reflog', 'recovery branch']]],
    ],
    [
        'key' => 'protected-pull-requests', 'title' => 'Branch Protection and Pull Request Workflows',
        'summary' => 'A pull-request workflow turns integration into a controlled change-management process: required reviews, status checks, limited write authority, and an auditable merge decision protect the main branch without blocking small, frequent delivery.',
        'definition' => 'Branch protection is a server-enforced policy on reference updates. Pull requests provide the review context around a proposed commit range, while required checks prove that the exact head commit satisfied automated quality gates before merge.',
        'scenario' => 'A 30-engineer product has daily releases, regulated payment code, and frequent parallel changes. Emergency fixes must remain possible, but no developer should be able to merge unreviewed code or bypass failing security checks silently.',
        'question' => 'Design a pull-request and branch-protection policy for this team. Explain required reviews, stale approval handling, status checks, merge strategy, emergency access, and the audit evidence you retain.',
        'mechanism' => ['Open a short-lived branch and focused pull request', 'Run required checks against the pull-request head SHA', 'Require ownership review and dismiss approvals after material changes', 'Merge using an approved strategy and retain the review and deployment record'],
        'use' => 'Require protection on release-bearing branches, CODEOWNERS review for sensitive paths, and a small set of deterministic checks that developers can also run locally.',
        'avoid' => 'Do not make every optional job a merge blocker or grant permanent bypass rights to a broad administrator group; both choices encourage unsafe workarounds.',
        'failure' => ['cause' => 'A privileged account bypasses checks or an approval remains valid after the reviewed code changes.', 'symptom' => 'The merged SHA has no matching successful check suite or current approval.', 'prevention' => 'Restrict bypass, dismiss stale reviews, and require checks on the current head SHA.', 'recovery' => 'Revert the merge, investigate the bypass event, rotate affected credentials, and rerun the complete gate.', 'monitoring' => 'Alert on protection changes, bypass merges, and repeated required-check overrides.'],
        'language' => 'yaml', 'code' => "# Repository ruleset (conceptual)\nrequired_reviews: 2\ndismiss_stale_reviews: true\nrequire_code_owner_review: true\nrequired_checks: [backend, frontend, security]\nallow_force_pushes: false",
        'sources' => ['github-actions', 'git-book'], 'visual' => 'pipeline',
        'claims' => [['Current revision', ['head SHA', 'current commit']], ['Human review', ['required review', 'CODEOWNERS']], ['Automated gates', ['required checks', 'status checks']], ['Controlled bypass', ['emergency', 'audit']]],
    ],
    [
        'key' => 'container-image-model', 'title' => 'Images, Containers, Layers, and Build Context',
        'summary' => 'An image is an immutable filesystem and metadata package assembled from reusable layers; a container is a runtime process with an isolated view of that image plus writable state. Build context controls what the builder can read.',
        'definition' => 'Docker executes Dockerfile instructions to produce content-addressed layers and configuration. The build context is transferred to the builder, `.dockerignore` excludes unnecessary files, and a container adds a temporary writable layer when the image runs.',
        'scenario' => 'A PHP service image takes nine minutes to build, is 1.4 GB, and accidentally contains `.env` and Git history. CI sends the entire monorepo as context and invalidates dependency layers whenever any source file changes.',
        'question' => 'Diagnose the slow and unsafe image build. Explain image layers, build context, cache invalidation, container writable state, and the concrete Dockerfile and `.dockerignore` changes you would make.',
        'mechanism' => ['Filter the build context before it reaches the builder', 'Execute each Dockerfile instruction and reuse matching cached layers', 'Store image configuration and immutable layer digests', 'Start a container with runtime configuration and an ephemeral writable layer'],
        'use' => 'Use small contexts, deterministic dependency manifests, and deliberate layer ordering so stable dependency installation is cached while frequently changing source is copied later.',
        'avoid' => 'Do not copy secrets into an image or treat a container writable layer as durable application storage. Runtime secrets and persistent data require dedicated mechanisms.',
        'failure' => ['cause' => 'A broad COPY instruction includes secrets and changes before dependency installation.', 'symptom' => 'Large images, cache misses, slow CI, and credentials visible in image history.', 'prevention' => 'Use `.dockerignore`, secret mounts, narrow COPY instructions, and ordered dependency layers.', 'recovery' => 'Revoke exposed credentials, remove the image from registries, rebuild cleanly, and verify the new digest.', 'monitoring' => 'Track image size, build duration, cache-hit rate, and secret-scan findings.'],
        'language' => 'dockerfile', 'code' => "FROM composer:2 AS vendor\nWORKDIR /app\nCOPY platform/api/composer.json platform/api/composer.lock ./\nRUN composer install --no-dev --no-scripts --prefer-dist\nCOPY platform/api .\n\nFROM php:8.3-fpm-alpine\nCOPY --from=vendor /app /var/www/html",
        'sources' => ['docker-build', 'github-actions-security'], 'visual' => 'data-flow',
        'claims' => [['Image and container', ['immutable image', 'container process']], ['Layer cache', ['layer', 'cache invalidation']], ['Build context', ['build context', '.dockerignore']], ['Secret boundary', ['secret mount', 'credentials']]],
    ],
    [
        'key' => 'multistage-build-cache', 'title' => 'Production Multi-stage Dockerfiles and Build Cache',
        'summary' => 'Multi-stage builds separate compilation from runtime, copying only required artifacts into a smaller final image. Effective caching depends on stable inputs, deterministic dependency locks, BuildKit cache mounts, and an instruction order aligned with change frequency.',
        'definition' => 'Each named stage has its own base and layer graph. `COPY --from` transfers selected outputs without carrying compilers or package-manager caches into production. BuildKit can persist dependency caches without baking them into the resulting layer.',
        'scenario' => 'A Laravel and React deployment currently installs Node, Composer, compilers, and development packages in production. Releases are 1.8 GB, builds are slow, and security scans report tools the application never uses at runtime.',
        'question' => 'Design a multi-stage build for the Laravel API and Vite SPA. Explain stage responsibilities, cache-friendly ordering, final-image contents, reproducibility, and how CI proves the image runs before publication.',
        'mechanism' => ['Build frontend assets in a Node stage from the lockfile', 'Install optimized PHP dependencies in a Composer stage', 'Copy application, vendor directory, and built assets into a PHP runtime stage', 'Run configuration checks and smoke tests against the final immutable image'],
        'use' => 'Use separate builder and runtime stages whenever compilation or dependency resolution requires tools that do not belong in the attack surface of the running service.',
        'avoid' => 'Do not rely on mutable base tags without recording resolved digests, and do not copy a complete builder filesystem into the runtime stage.',
        'failure' => ['cause' => 'An early source COPY invalidates dependency layers or a runtime extension is present only in the builder.', 'symptom' => 'Every build reinstalls dependencies, or the published container fails immediately at startup.', 'prevention' => 'Copy lockfiles first, declare runtime extensions explicitly, and test the final stage.', 'recovery' => 'Rebuild from the previous known base digest, restore the missing runtime dependency, and republish a new immutable digest.', 'monitoring' => 'Measure build time, image size, cache reuse, startup failures, and vulnerability count.'],
        'language' => 'dockerfile', 'code' => "FROM node:22-alpine AS web\nWORKDIR /src\nCOPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./\nCOPY platform/web/package.json platform/web/package.json\nRUN corepack enable && pnpm install --frozen-lockfile\nCOPY platform/web platform/web\nRUN pnpm --dir platform/web build\n\nFROM php:8.3-fpm-alpine AS runtime\nCOPY --from=web /src/platform/web/dist /var/www/html/public",
        'sources' => ['docker-build', 'github-actions'], 'visual' => 'pipeline',
        'claims' => [['Stage separation', ['builder stage', 'runtime stage']], ['Selective copy', ['COPY --from', 'artifacts']], ['Reproducibility', ['lockfile', 'digest']], ['Final-stage test', ['smoke test', 'final image']]],
    ],
    [
        'key' => 'container-runtime-safety', 'title' => 'Container Runtime Security, Configuration, Signals, and Health',
        'summary' => 'A production container should run one supervised concern as a non-root user, receive configuration and secrets at runtime, handle termination signals predictably, expose meaningful health checks, and keep its filesystem and Linux capabilities minimal.',
        'definition' => 'Container isolation shares the host kernel; it is not a virtual-machine security boundary. Runtime controls limit identity, capabilities, filesystem writes, resources, and secret exposure. PID 1 must forward signals and reap child processes correctly.',
        'scenario' => 'During deployment a PHP worker loses in-flight jobs, the web container reports healthy before dependencies are ready, and an attacker who gains code execution runs as root with a writable filesystem and mounted cloud credentials.',
        'question' => 'Harden this container runtime and graceful-shutdown path. Cover user identity, secrets, filesystem permissions, Linux capabilities, resource limits, health semantics, PID 1, and queue-worker termination.',
        'mechanism' => ['Inject validated runtime configuration without adding it to image layers', 'Run the intended process as an unprivileged user with minimal capabilities', 'Use readiness for traffic admission and liveness only for unrecoverable process failure', 'On SIGTERM, stop accepting work, finish bounded in-flight work, and exit before the grace period'],
        'use' => 'Use defense-in-depth runtime restrictions for every workload and design explicit startup, readiness, shutdown, and restart behavior for web, worker, and scheduler roles.',
        'avoid' => 'Do not put secrets in Dockerfile ENV instructions, use liveness probes to test slow external dependencies, or assume root inside a container is harmless.',
        'failure' => ['cause' => 'The process ignores SIGTERM or the orchestrator kills it before work drains.', 'symptom' => 'Duplicate jobs, partial responses, abrupt disconnects, and repeated restart loops.', 'prevention' => 'Use exec-form commands, signal-aware workers, bounded grace periods, and idempotent jobs.', 'recovery' => 'Replay idempotent work, repair partial state, and roll back the unhealthy image digest.', 'monitoring' => 'Observe restarts, termination duration, probe failures, resource throttling, and duplicate-job rate.'],
        'language' => 'dockerfile', 'code' => "RUN addgroup --system app && adduser --system --ingroup app app\nUSER app\nSTOPSIGNAL SIGTERM\nHEALTHCHECK --interval=30s --timeout=3s CMD php artisan about || exit 1\nCMD [\"php-fpm\", \"-F\"]",
        'sources' => ['docker-build', 'owasp-secrets'], 'visual' => 'architecture',
        'claims' => [['Least privilege', ['non-root', 'capabilities']], ['Runtime secrets', ['runtime configuration', 'secrets']], ['Health semantics', ['readiness', 'liveness']], ['Graceful termination', ['SIGTERM', 'drain']]],
    ],
    [
        'key' => 'compose-service-topology', 'title' => 'Docker Compose Networks, Volumes, and Service Dependencies',
        'summary' => 'Compose defines a reproducible multi-service environment with DNS-based service discovery, explicit networks, durable named volumes, health-aware dependencies, and role-specific commands. It models topology but does not replace application-level retries or migrations.',
        'definition' => 'Services join project networks and resolve one another by service name. Named volumes outlive containers. `depends_on` controls startup ordering and can wait for health, but it cannot guarantee that a dependency remains available after startup.',
        'scenario' => 'New developers run six manual commands for PHP, Nginx, MariaDB, Redis, a queue worker, and a scheduler. Startup races cause connection errors, database data disappears on rebuild, and every service can reach every other service.',
        'question' => 'Design a Compose topology for the application. Explain network boundaries, persistent volumes, health checks, startup dependencies, worker and scheduler roles, migrations, and why clients still need retry behavior.',
        'mechanism' => ['Create frontend and backend networks with only required service membership', 'Persist MariaDB and Redis data in named volumes when persistence is desired', 'Gate dependent startup on meaningful health checks rather than fixed sleeps', 'Run web, queue, and scheduler from one image with different commands and independent lifecycles'],
        'use' => 'Use Compose for local integration and single-host reproducibility, keeping environment-specific configuration outside the image and documenting bootstrap and reset operations.',
        'avoid' => 'Do not expose database ports unnecessarily, share mutable source volumes in production, or treat startup order as a substitute for resilient clients.',
        'failure' => ['cause' => 'The database is running but not ready, or a service name is replaced with localhost inside a container.', 'symptom' => 'Intermittent connection refusal and workers that never reach MariaDB or Redis.', 'prevention' => 'Use service DNS names, health checks, retry budgets, and explicit networks.', 'recovery' => 'Restart only the failed role, preserve named data volumes, and verify schema state before replaying work.', 'monitoring' => 'Inspect health state, restart count, network errors, volume capacity, and queue depth.'],
        'language' => 'yaml', 'code' => "services:\n  app:\n    build: .\n    depends_on:\n      db: { condition: service_healthy }\n      redis: { condition: service_healthy }\n  worker:\n    image: backend-lab:local\n    command: php artisan queue:work --tries=3\n  db:\n    image: mariadb:11\n    volumes: [db-data:/var/lib/mysql]\nvolumes:\n  db-data:",
        'sources' => ['docker-build', 'laravel-docs'], 'visual' => 'architecture',
        'claims' => [['Service discovery', ['service name', 'DNS']], ['Durable state', ['named volume', 'persistent']], ['Health dependency', ['health check', 'depends_on']], ['Independent roles', ['worker', 'scheduler']]],
    ],
    [
        'key' => 'delivery-strategies', 'title' => 'CI, Continuous Delivery, and Continuous Deployment',
        'summary' => 'Continuous integration validates small changes frequently. Continuous delivery keeps every accepted revision releasable through an automated pipeline, while continuous deployment automatically promotes every qualified revision to production without a manual release decision.',
        'definition' => 'CI is the feedback and integration discipline; delivery is the ability to deploy on demand; deployment is the policy of automatically releasing. All require repeatable tests, artifact identity, environment controls, observability, and a safe recovery path.',
        'scenario' => 'A team merges twice daily but releases monthly through a manual checklist. Environment drift, rebuilt artifacts, risky database changes, and unclear ownership make each release a six-hour event with frequent rollbacks.',
        'question' => 'Distinguish CI, continuous delivery, and continuous deployment, then design a staged path from this manual release process to safe on-demand delivery without pretending that automation eliminates risk.',
        'mechanism' => ['Validate every change with fast deterministic CI feedback', 'Build one immutable artifact and attach evidence to its digest', 'Promote that same artifact through protected environments and health checks', 'Use progressive rollout, telemetry, and automatic or operator-triggered rollback'],
        'use' => 'Adopt continuous delivery first when business or regulatory approval is required; enable automatic production promotion only after quality gates and recovery signals are trustworthy.',
        'avoid' => 'Do not call a scheduled manual build continuous delivery, rebuild per environment, or optimize deployment frequency before failures are observable and reversible.',
        'failure' => ['cause' => 'A pipeline promotes an unidentifiable rebuild or treats passing unit tests as complete production evidence.', 'symptom' => 'Production behavior cannot be traced to reviewed source, and rollback reproduces a different artifact.', 'prevention' => 'Promote by digest, retain attestations, require layered tests, and define release SLOs.', 'recovery' => 'Stop promotion, restore the previous digest, apply a compatible data rollback strategy, and preserve incident evidence.', 'monitoring' => 'Measure lead time, deployment frequency, change failure rate, recovery time, and rollback success.'],
        'language' => 'pseudocode', 'code' => "on accepted change:\n  test source revision\n  build artifact once\n  record digest and evidence\n  promote digest to staging\n  verify health and migrations\n  approve or automatically promote same digest\n  rollback on SLO breach",
        'sources' => ['github-actions', 'google-sre'], 'visual' => 'pipeline',
        'claims' => [['CI definition', ['continuous integration', 'feedback']], ['Delivery definition', ['deploy on demand', 'releasable']], ['Deployment definition', ['automatic promotion', 'production']], ['Artifact promotion', ['same artifact', 'digest']]],
    ],
    [
        'key' => 'actions-execution-model', 'title' => 'GitHub Actions Events, Jobs, Dependencies, Matrix, and Concurrency',
        'summary' => 'GitHub Actions maps repository events to workflows, jobs, and steps. Job dependencies form a directed graph, matrices create controlled variants, and concurrency groups prevent obsolete or conflicting runs from consuming capacity or deploying simultaneously.',
        'definition' => 'A workflow is a versioned YAML program triggered by events. Jobs run on isolated runners and are parallel unless linked by `needs`. Matrix expansion creates job combinations; concurrency groups serialize or cancel runs sharing a deployment or branch key.',
        'scenario' => 'Pull requests launch duplicate PHP, database, and frontend jobs after every push. Old commits deploy after newer commits, two production releases overlap, and the team cannot tell which outputs belong to which matrix variant.',
        'question' => 'Design the workflow execution graph. Specify safe events, job dependencies, matrix axes, fail-fast behavior, concurrency keys, cancellation policy, outputs, and how deployment is restricted to the tested revision.',
        'mechanism' => ['Filter events and paths so untrusted or irrelevant changes receive the correct workflow', 'Expand compatibility jobs across explicit PHP and database matrix values', 'Use needs and outputs to join test evidence before building or deploying', 'Serialize production by environment and cancel obsolete branch-level validation runs'],
        'use' => 'Use matrices for real compatibility contracts and concurrency for work that must not overlap or whose older results become irrelevant after a new commit.',
        'avoid' => 'Do not grant deployment permissions to pull-request jobs, create a combinatorial matrix with no supported use case, or cancel an in-progress production migration blindly.',
        'failure' => ['cause' => 'A concurrency group omits the environment or a deployment job checks out a moving branch.', 'symptom' => 'Two releases mutate production together or the deployed SHA differs from the tested SHA.', 'prevention' => 'Key by environment, pass immutable SHA or digest outputs, and use explicit needs.', 'recovery' => 'Cancel queued conflicts, inspect environment history, restore the previous digest, and reconcile migration state.', 'monitoring' => 'Track queue duration, cancellation rate, matrix failures, deployed SHA, and environment locks.'],
        'language' => 'yaml', 'code' => <<<'YAML'
on:
  pull_request:
  push: { branches: [main] }
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  backend:
    strategy:
      matrix: { php: ['8.3', '8.5'], database: [mariadb, mysql] }
  build:
    needs: [backend, frontend]
YAML,
        'sources' => ['github-actions', 'github-actions-security'], 'visual' => 'pipeline',
        'claims' => [['Event boundary', ['event', 'pull_request']], ['Dependency graph', ['needs', 'outputs']], ['Compatibility matrix', ['matrix', 'PHP']], ['Concurrency control', ['concurrency group', 'cancel-in-progress']]],
    ],
    [
        'key' => 'cache-artifact-promotion', 'title' => 'Dependency Caches, Build Artifacts, and Immutable Promotion',
        'summary' => 'A dependency cache is an untrusted performance optimization keyed by inputs; a build artifact is a tested release candidate with identity and retention. Safe delivery promotes one immutable artifact instead of rebuilding separately for each environment.',
        'definition' => 'Caches may be restored by partial keys and can disappear without affecting correctness. Artifacts are explicit workflow outputs. Container digests identify immutable image content, allowing staging and production to execute exactly the bytes that passed earlier gates.',
        'scenario' => 'CI restores a stale vendor directory, a feature branch poisons a shared cache, and production rebuilds from source after staging approval. A rollback tag points to a different image because the tag was overwritten.',
        'question' => 'Explain the security and correctness differences among caches, workflow artifacts, image tags, and image digests. Design cache keys and an immutable build-once promotion process with retention and rollback.',
        'mechanism' => ['Key dependency caches from lockfile, platform, and toolchain inputs', 'Treat restored cache content as replaceable and validate installed dependencies', 'Package one tested artifact and record its cryptographic digest and provenance', 'Promote and roll back by immutable digest while using tags only as movable discovery labels'],
        'use' => 'Cache downloads or compiler work to reduce latency, and use retained artifacts or registry digests for anything that crosses a release boundary.',
        'avoid' => 'Do not place secrets in caches, trust fork-written caches, use a cache as the only copy of a release, or deploy a mutable `latest` tag.',
        'failure' => ['cause' => 'An overly broad key restores incompatible or attacker-controlled content.', 'symptom' => 'Non-reproducible builds, unexpected binaries, or a production digest that differs from staging.', 'prevention' => 'Scope cache writes, hash lockfiles, verify packages, sign evidence, and promote digests.', 'recovery' => 'Disable the cache, rebuild from declared inputs, revoke compromised artifacts, and redeploy the last verified digest.', 'monitoring' => 'Measure cache hit rate separately from correctness, and audit artifact digest, provenance, and retention.'],
        'language' => 'yaml', 'code' => <<<'YAML'
- uses: actions/cache@<full-commit-sha>
  with:
    path: ~/.composer/cache
    key: composer-${{ runner.os }}-${{ hashFiles('platform/api/composer.lock') }}
- run: docker build -t ghcr.io/org/app:${{ github.sha }} .
- run: docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/org/app:${{ github.sha }}
YAML,
        'sources' => ['github-actions', 'github-actions-security'], 'visual' => 'data-flow',
        'claims' => [['Cache semantics', ['performance optimization', 'lockfile']], ['Artifact semantics', ['workflow artifact', 'retention']], ['Immutable identity', ['digest', 'immutable']], ['Build once', ['same artifact', 'promote']]],
    ],
    [
        'key' => 'quality-gates', 'title' => 'Quality Gates: Tests, Linting, Static Analysis, and Security Scans',
        'summary' => 'A useful quality gate provides fast, reproducible evidence about a defined risk. Layered tests, formatting, linting, type analysis, dependency review, secret detection, and image scanning should block only on actionable, owned policies.',
        'definition' => 'Quality gates are automated acceptance conditions attached to the exact revision or artifact. Different tools detect different failure classes; no single percentage or scanner replaces risk-based tests, human design review, and runtime observation.',
        'scenario' => 'A pipeline takes 48 minutes, flakes one run in five, reports hundreds of ignored warnings, and still ships authorization regressions. Developers rerun jobs until green and administrators routinely bypass protection.',
        'question' => 'Redesign these quality gates. Explain test layers, parallel feedback, deterministic environments, static analysis, dependency and container scanning, severity policy, flaky-test ownership, and merge-blocking criteria.',
        'mechanism' => ['Run formatting and focused static checks first for rapid feedback', 'Execute unit, feature, contract, and selected end-to-end tests in isolated deterministic environments', 'Scan dependencies, source, secrets, and the final container artifact against documented policy', 'Aggregate required evidence and publish actionable failures before allowing merge or promotion'],
        'use' => 'Block on high-confidence violations of owned policy, while tracking advisory findings with deadlines and named owners so the signal remains credible.',
        'avoid' => 'Do not equate code coverage with correctness, tolerate indefinite flakes, or block releases on untriaged scanner noise that nobody can resolve.',
        'failure' => ['cause' => 'Nondeterministic tests and noisy scanners train developers to ignore or bypass the pipeline.', 'symptom' => 'Frequent reruns, long queues, waived failures, and escaped defects in supposedly covered paths.', 'prevention' => 'Quarantine with deadlines, fix root causes, pin environments, and tune severity policy.', 'recovery' => 'Stop promotion for credible risk, reproduce locally, patch or revert, and add the smallest regression test that proves the failure.', 'monitoring' => 'Track time to feedback, flake rate, bypass frequency, escaped defects, and mean remediation age.'],
        'language' => 'shell', 'code' => "composer validate --strict\nphp artisan test --parallel\npnpm --dir platform/web lint\npnpm --dir platform/web typecheck\npnpm --dir platform/web test\ndocker build --check .\n# Scan the resulting image digest, not only source files.",
        'sources' => ['github-actions', 'software-engineering-google'], 'visual' => 'pipeline',
        'claims' => [['Layered evidence', ['unit', 'feature', 'end-to-end']], ['Static checks', ['lint', 'static analysis']], ['Artifact scanning', ['container', 'dependency scan']], ['Credible policy', ['flake', 'severity']]],
    ],
    [
        'key' => 'workflow-security', 'title' => 'Workflow Security: Permissions, Pinned Actions, Secrets, OIDC, and Fork Threats',
        'summary' => 'CI workflows execute attacker-influenced code near source, tokens, artifacts, and deployment authority. Secure workflows minimize token permissions, pin third-party actions, separate untrusted pull requests, protect secrets, and prefer short-lived OIDC credentials.',
        'definition' => 'Workflow security treats event payloads, branch content, action code, caches, artifacts, and runners as trust boundaries. `GITHUB_TOKEN` scopes must be explicit, external actions require immutable commit pins, and privileged jobs must never execute unreviewed fork code.',
        'scenario' => 'An open-source repository accepts fork pull requests and deploys to a cloud account. A proposed workflow change prints environment values, replaces a third-party action tag, and uses `pull_request_target` while checking out the contributor branch.',
        'question' => 'Threat-model this workflow and redesign it. Cover event choice, untrusted checkout, token permissions, action pinning, secret availability, artifact poisoning, environment approval, OIDC claims, and runner isolation.',
        'mechanism' => ['Run untrusted pull-request validation with read-only permissions and no protected secrets', 'Pin every external action to a reviewed full commit SHA', 'Pass only verified artifacts into a separately triggered privileged release workflow', 'Exchange a narrowly scoped OIDC identity for short-lived deployment credentials after protected-environment approval'],
        'use' => 'Use explicit per-job permissions, trusted reusable workflows, protected environments, subject-restricted OIDC roles, and ephemeral hosted runners for sensitive boundaries.',
        'avoid' => 'Never combine `pull_request_target`, untrusted checkout, and secrets; do not trust mutable action tags or allow a broad cloud role to any repository workflow.',
        'failure' => ['cause' => 'Untrusted code gains a write token, secret, persistent runner, or privileged downstream artifact channel.', 'symptom' => 'Unexpected releases, token use, modified tags, exfiltration, or cloud actions outside the approved job.', 'prevention' => 'Separate trust levels, pin dependencies, restrict claims and permissions, and attest artifacts.', 'recovery' => 'Revoke credentials and tokens, disable workflows, rotate secrets, invalidate artifacts, and audit repository and cloud logs.', 'monitoring' => 'Alert on permission changes, unpinned actions, unusual OIDC subjects, environment bypass, and runner persistence.'],
        'language' => 'yaml', 'code' => "permissions:\n  contents: read\n  id-token: write\nenvironment: production\nsteps:\n  - uses: actions/checkout@<full-commit-sha>\n    with: { persist-credentials: false }\n  - name: Obtain short-lived cloud identity\n    uses: cloud/login@<full-commit-sha>",
        'sources' => ['github-actions-security', 'owasp-secrets'], 'visual' => 'data-flow',
        'claims' => [['Least privilege', ['permissions', 'read-only']], ['Immutable actions', ['full commit SHA', 'pin']], ['Fork isolation', ['untrusted', 'pull_request_target']], ['Short-lived identity', ['OIDC', 'short-lived']]],
    ],
    [
        'key' => 'trusted-container-release', 'title' => 'Container Publishing: Tags, Digests, SBOMs, Provenance, and Safe Rollout',
        'summary' => 'A trusted container release binds reviewed source, build instructions, dependencies, an SBOM, provenance evidence, and scan results to one immutable digest, then rolls that digest out progressively with health gates and a tested rollback path.',
        'definition' => 'Tags are mutable names; a registry digest is the immutable content identity. An SBOM inventories components, while provenance attests how and from which source an artifact was built. Neither replaces vulnerability handling or runtime controls.',
        'scenario' => 'A release tagged `latest` passes staging but production pulls a later rebuild. Operators cannot identify included packages, a migration breaks old application instances, and rollback redeploys the same bad tag.',
        'question' => 'Design the publication and rollout process from accepted commit to production. Explain tags versus digests, SBOM and provenance, signing or attestation verification, expand-contract migrations, progressive health checks, and automatic rollback.',
        'mechanism' => ['Build once from the accepted commit and push content-addressed layers', 'Generate SBOM and provenance and bind attestations to the published digest', 'Verify policy before promoting that exact digest into a protected environment', 'Apply backward-compatible migration, roll out progressively, observe SLOs, and restore the previous digest on failure'],
        'use' => 'Publish human-friendly version and commit tags for discovery, but record, deploy, verify, and roll back the immutable digest.',
        'avoid' => 'Do not rebuild after approval, consider an SBOM a security verdict, or deploy a destructive schema change that old and new application versions cannot both tolerate.',
        'failure' => ['cause' => 'A mutable tag or incompatible migration makes rollback select the wrong bytes or unusable schema.', 'symptom' => 'Staging and production digests differ, old instances error, and rollback fails to restore service.', 'prevention' => 'Promote digests, verify attestations, use expand-contract migrations, and rehearse rollback.', 'recovery' => 'Pause rollout, restore the prior digest, complete or compensate the compatible schema step, and reconcile queued work.', 'monitoring' => 'Record deployed digest, attestation verification, rollout error budget, migration status, and rollback duration.'],
        'language' => 'shell', 'code' => <<<'SHELL'
docker buildx build --push --tag ghcr.io/acme/backend:${GIT_SHA} .
# Capture the registry digest returned by the push.
syft ghcr.io/acme/backend@${DIGEST} -o spdx-json
# Verify provenance before deployment.
kubectl set image deployment/backend app=ghcr.io/acme/backend@${DIGEST}
SHELL,
        'sources' => ['github-actions-security', 'docker-build'], 'visual' => 'pipeline',
        'claims' => [['Immutable release', ['digest', 'build once']], ['Component inventory', ['SBOM', 'components']], ['Build evidence', ['provenance', 'attestation']], ['Safe rollout', ['expand-contract', 'rollback']]],
    ],
];
