# Architecture

## Dependency direction

```text
React routes/features -> typed API boundary
Laravel HTTP -> application actions -> domain contracts -> infrastructure adapters
```

Controllers validate transport input and delegate. Application actions own transactions and use cases. Domain contracts contain provider-independent behavior. Infrastructure implements external boundaries such as OpenAI and deterministic scoring.

## Backend modules

- `Application/Assessment`: immutable attempt submission and asynchronous evaluation.
- `Application/ContentManagement`: optimistic CMS updates, revisions and audit records.
- `Domain/Assessment`: evaluator contract and result value object.
- `Infrastructure/AI`: OpenAI Responses adapter, deterministic fallback and provider factory.
- `Http`: versioned JSON endpoints, Form Requests and request IDs.
- `Policies`: role-aware authorization.

Permanent entities use ULIDs. URLs use slugs. Every imported positional identifier is retained in `legacy_key`. Attempts are immutable; editable learner text carries a resource version.

## Frontend modules

- `app`: providers and lazy route registry.
- `features`: dashboard, curriculum, authentication, CMS, libraries, navigation and shell.
- `entities`: domain-facing TypeScript types.
- `shared`: API transport, IndexedDB mutation queue, hooks and design tokens.

The browser sends credentialed same-origin requests. Sanctum supplies CSRF-protected cookie sessions. Catalog and learner mutations can be cached/queued locally; conflicts must be surfaced instead of silently overwritten.

## Assessment flow

1. A learner submits an answer; the API persists an immutable attempt and returns `202`.
2. A database-queue job invokes the configured `AnswerEvaluator`.
3. `openai` uses the Responses API with `store: false` and a strict JSON schema; `deterministic` is the offline/CI strategy.
4. Provider failures fall back only when configured, and job status/failure metadata remains observable.

No executable simulator code is stored in MariaDB. CMS records may select only server-validated simulator registry keys.

## Local production shape

Apache listens on port 8080 with Laravel `public` as the document root. Laravel serves `/api/v1`, `/sanctum` and `/up`; all canonical UI routes return the compiled SPA. Production requires no Node runtime after the build.
