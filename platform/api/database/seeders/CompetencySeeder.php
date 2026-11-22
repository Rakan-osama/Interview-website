<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

final class CompetencySeeder extends Seeder
{
    public function run(): void
    {
        $hubs = $this->hubs();
        DB::transaction(function () use ($hubs): void {
            foreach ($hubs as $position => $hub) {
                $this->upsertHub($position, $hub);
            }
        });
    }

    private function upsertHub(int $position, array $hub): void
    {
        $existing = DB::table('competencies')->where('slug', $hub['slug'])->first();
        $competencyId = $existing?->id ?? (string) Str::ulid();
        DB::table('competencies')->updateOrInsert(['slug' => $hub['slug']], [
            'id' => $competencyId, 'title' => $hub['title'], 'summary' => $hub['summary'],
            'outcomes' => json_encode($hub['outcomes'], JSON_THROW_ON_ERROR), 'position' => $position,
            'created_at' => $existing?->created_at ?? now(), 'updated_at' => now(),
        ]);

        $keptModuleIds = [];
        foreach ($hub['modules'] as $modulePosition => $module) {
            $record = DB::table('competency_modules')
                ->where('competency_id', $competencyId)->where('module_key', $module['key'])->first();
            $moduleId = $record?->id ?? (string) Str::ulid();
            $keptModuleIds[] = $moduleId;
            DB::table('competency_modules')->updateOrInsert([
                'competency_id' => $competencyId, 'module_key' => $module['key'],
            ], [
                'id' => $moduleId, 'title' => $module['title'], 'summary' => $module['summary'],
                'position' => $modulePosition, 'created_at' => $record?->created_at ?? now(), 'updated_at' => now(),
            ]);
            DB::table('competency_module_lesson')->where('competency_module_id', $moduleId)->delete();
            foreach ($this->lessonIds($module) as $lessonPosition => $lessonId) {
                DB::table('competency_module_lesson')->insert([
                    'competency_module_id' => $moduleId, 'lesson_id' => $lessonId,
                    'is_required' => true, 'position' => $lessonPosition,
                ]);
            }
        }

        DB::table('competency_modules')->where('competency_id', $competencyId)
            ->whereNotIn('id', $keptModuleIds)->delete();
    }

    private function lessonIds(array $module): array
    {
        if (isset($module['track'])) {
            $ids = DB::table('lessons')->join('tracks', 'tracks.id', '=', 'lessons.track_id')
                ->where('tracks.legacy_key', $module['track'])->orderBy('lessons.position')->pluck('lessons.id')->all();
        } else {
            $idsByKey = DB::table('lessons')->whereIn('legacy_key', $module['lessons'])->pluck('id', 'legacy_key');
            $ids = collect($module['lessons'])->map(fn (string $key) => $idsByKey[$key] ?? null)->filter()->values()->all();
        }
        $expected = $module['expected'];
        if (count($ids) !== $expected) {
            throw new RuntimeException("Competency module {$module['key']} expected {$expected} lessons and found ".count($ids).'.');
        }

        return $ids;
    }

    private function hubs(): array
    {
        return [
            [
                'slug' => 'delivery-engineering', 'title' => 'Delivery Engineering',
                'summary' => 'Master recoverable source control, production container design, secure CI workflows, immutable artifacts, and evidence-based deployment and rollback.',
                'outcomes' => ['Design protected Git collaboration', 'Build minimal production containers', 'Create secure CI/CD pipelines', 'Promote and roll back immutable artifacts'],
                'modules' => [
                    $this->trackModule('delivery-core', 'Git, Docker, and CI/CD', 'The complete production delivery path.', 'se:delivery-engineering', 12),
                    $this->keyModule('collaboration', 'Collaboration and Recovery', 'Resolve conflicts, choose safe history operations, and conduct useful review.', ['22-6', '22-2', '22-3']),
                    $this->keyModule('release-safety', 'Release and Schema Safety', 'Build reproducible artifacts and roll out code and schema changes safely.', ['34-2', '34-3', '17-3']),
                ],
            ],
            [
                'slug' => 'caching-asynchronous-work', 'title' => 'Caching and Asynchronous Work',
                'summary' => 'Choose cache boundaries, operate Redis under memory pressure, design idempotent jobs, handle retries and ordering, and protect systems with backpressure.',
                'outcomes' => ['Choose when not to cache', 'Diagnose Redis failure', 'Design reliable idempotent jobs', 'Apply ordering and backpressure controls'],
                'modules' => [
                    $this->trackModule('cache-decisions', 'Cache and Redis Decisions', 'Treat cache as an expiring copy with explicit failure behavior.', 'se:cache-redis', 8),
                    $this->trackModule('laravel-queues', 'Laravel Queues', 'Payloads, dispatch timing, uniqueness, batches, and deployment.', '14', 6),
                    $this->trackModule('laravel-cache', 'Laravel Cache and Redis Operations', 'Tenant keys, invalidation, eviction, sessions, and stampede control.', '15', 6),
                    $this->trackModule('distributed-work', 'Distributed Messaging', 'Acknowledgment, ordering, replicas, sagas, and partitions.', '32', 5),
                    $this->keyModule('reliability', 'Queue Reliability and Backpressure', 'Bound retries, duplicate work, and overload.', ['8-1', '8-4']),
                ],
            ],
            [
                'slug' => 'secure-backend-engineering', 'title' => 'Secure Backend Engineering',
                'summary' => 'Implement authentication, authorization, validation, credentials, tenant boundaries, and privacy controls as explicit trust-boundary decisions with auditable failure handling.',
                'outcomes' => ['Distinguish identity from authority', 'Validate untrusted input', 'Protect and rotate credentials', 'Threat-model tenant and privacy boundaries'],
                'modules' => [
                    $this->trackModule('identity', 'Identity and Access', 'Sessions, tokens, OAuth, OpenID Connect, revocation, and recovery.', 'se:identity-authentication', 9),
                    $this->trackModule('owasp', 'OWASP Application Security', 'Trust boundaries and the current major application-security risks.', 'se:application-security-2025', 12),
                    $this->trackModule('backend-threats', 'Backend Security Failures', 'SSRF, injection, secrets, logging, serialization, and threat modeling.', '21', 6),
                    $this->trackModule('sensitive-data', 'Credentials and Sensitive Data', 'Cryptographic goals, incident response, retention, and privacy.', '35', 5),
                ],
            ],
            [
                'slug' => 'relational-data-engineering', 'title' => 'Relational Data Engineering',
                'summary' => 'Translate business invariants into relational schemas, choose indexes from workloads, read query plans, reason about isolation and locking, and design recoverable transactions.',
                'outcomes' => ['Model relational invariants', 'Choose and verify indexes', 'Diagnose query plans and contention', 'Design transaction and recovery boundaries'],
                'modules' => [
                    $this->trackModule('performance', 'Database Performance', 'N+1, indexes, query investigation, locking, and connection pressure.', '5', 10),
                    $this->trackModule('sql-design', 'SQL Modeling and Transactions', 'Schemas, joins, aggregates, injection boundaries, and recovery.', '20', 9),
                    $this->trackModule('internals', 'Relational Internals', 'Dependencies, workloads, visibility, durability, and cardinality.', '30', 5),
                ],
            ],
        ];
    }

    private function trackModule(string $key, string $title, string $summary, string $track, int $expected): array
    {
        return compact('key', 'title', 'summary', 'track', 'expected');
    }

    private function keyModule(string $key, string $title, string $summary, array $lessons): array
    {
        return ['key' => $key, 'title' => $title, 'summary' => $summary, 'lessons' => $lessons, 'expected' => count($lessons)];
    }
}
