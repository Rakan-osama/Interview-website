<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

final class ProfessionalCurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $topics = config('delivery_curriculum');
        $this->validateTopics($topics);

        DB::transaction(function () use ($topics): void {
            $trackId = $this->upsertTrack();
            foreach ($topics as $position => $topic) {
                $this->upsertTopic($trackId, $position, $topic);
            }
            $this->upsertProjects();
        });
    }

    private function upsertTrack(): string
    {
        $legacyKey = 'se:delivery-engineering';
        $existing = DB::table('tracks')->where('legacy_key', $legacyKey)->first();
        $id = $existing?->id ?? (string) Str::ulid();
        $categoryId = DB::table('categories')->orderBy('position')->value('id');

        DB::table('tracks')->updateOrInsert(['legacy_key' => $legacyKey], [
            'id' => $id,
            'category_id' => $categoryId,
            'slug' => 'delivery-engineering-git-docker-ci-cd',
            'title' => 'Git, Docker, and CI/CD Engineering',
            'title_ar' => null,
            'description' => 'Build recoverable Git workflows, secure production containers, and delivery pipelines that promote one verified artifact through controlled environments.',
            'color' => '#2563eb',
            'icon' => 'pipeline',
            'position' => 62,
            'created_at' => $existing?->created_at ?? now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    private function upsertTopic(string $trackId, int $position, array $topic): void
    {
        $legacyKey = 'se:delivery:'.($position + 1);
        $lesson = DB::table('lessons')->where('legacy_key', $legacyKey)->first();
        $lessonId = $lesson?->id ?? (string) Str::ulid();
        $content = $this->conceptContent($topic);
        $modelAnswer = $this->modelAnswer($topic);

        DB::table('lessons')->updateOrInsert(['legacy_key' => $legacyKey], [
            'id' => $lessonId,
            'track_id' => $trackId,
            'slug' => $topic['key'],
            'title' => $topic['title'],
            'objective' => 'Explain '.$topic['title'].' from its internal mechanism to a safe production decision, failure response, and verification strategy.',
            'explanation' => $topic['definition'],
            'plain_explanation' => $topic['summary'],
            'practical_example' => $topic['scenario'],
            'interview_question' => $topic['question'],
            'model_answer' => $modelAnswer,
            'code' => $topic['code'],
            'reference_solution' => $modelAnswer,
            'common_mistake' => $topic['avoid'],
            'pitfall' => $topic['failure']['cause'].' '.$topic['failure']['symptom'],
            'position' => $position,
            'version' => 3,
            'created_at' => $lesson?->created_at ?? now(),
            'updated_at' => now(),
        ]);

        $conceptLegacyKey = 'concept:delivery:'.($position + 1);
        $concept = DB::table('concepts')->where('legacy_key', $conceptLegacyKey)->first();
        $conceptId = $concept?->id ?? (string) Str::ulid();
        DB::table('concepts')->updateOrInsert(['legacy_key' => $conceptLegacyKey], [
            'id' => $conceptId,
            'slug' => $topic['key'],
            'title' => $topic['title'],
            'group_name' => 'Delivery Engineering',
            'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            'version' => 3,
            'created_at' => $concept?->created_at ?? now(),
            'updated_at' => now(),
        ]);
        DB::table('concept_lesson')->updateOrInsert(['concept_id' => $conceptId, 'lesson_id' => $lessonId]);

        $sourceIds = $this->linkSources($lessonId, $conceptId, $topic['sources']);
        $this->upsertRubricAndClaims($lessonId, $conceptId, $topic['claims'], $sourceIds);
        $this->upsertVisual($lessonId, $topic);
        $this->upsertReview('lesson', $lessonId, $modelAnswer);
        $this->upsertReview('concept', $conceptId, json_encode($content, JSON_THROW_ON_ERROR));
    }

    private function conceptContent(array $topic): array
    {
        $mechanism = implode(' ', array_map(
            fn (string $step, int $index): string => 'Step '.($index + 1).': '.$step.'.',
            $topic['mechanism'], array_keys($topic['mechanism']),
        ));
        $failure = $topic['failure'];

        return [
            'schemaVersion' => 3,
            'contentRevision' => 7,
            'summary' => $topic['summary'],
            'definition' => $topic['definition'],
            'guidedQuestions' => [
                ['question' => 'What is '.$topic['title'].', and which engineering guarantee does it provide?', 'answer' => $topic['summary'].' '.$topic['definition'].' The production decision is: '.$topic['use']],
                ['question' => 'How does it work from input to an observable result?', 'answer' => $mechanism.' The important failure symptom is '.$failure['symptom'].' Prevention therefore includes '.$failure['prevention']],
                ['question' => 'When should a production team use it, and when should the team choose a simpler boundary?', 'answer' => $topic['scenario'].' '.$topic['use'].' '.$topic['avoid'].' The choice must be tied to the stated scale, trust boundary, and recovery requirement rather than copied from another system.'],
                ['question' => 'How can it fail, and how should engineers detect and recover from that failure?', 'answer' => 'Cause: '.$failure['cause'].' Symptom: '.$failure['symptom'].' Prevention: '.$failure['prevention'].' Recovery: '.$failure['recovery'].' Monitoring: '.$failure['monitoring'].' Rehearse that recovery before an incident, assign an owner, and retain enough evidence to distinguish successful repair from a temporary reduction in visible errors.'],
            ],
            'mechanismSteps' => array_map(
                fn (string $step, int $index): array => ['title' => 'Step '.($index + 1), 'description' => $step],
                $topic['mechanism'], array_keys($topic['mechanism']),
            ),
            'whenToUse' => [$topic['use']],
            'whenNotToUse' => [$topic['avoid']],
            'productionScenarios' => [['context' => $topic['scenario'], 'decision' => $topic['use'], 'constraints' => $topic['avoid']]],
            'failureModes' => [$failure],
            'codeExamples' => [[
                'language' => $topic['language'],
                'label' => 'Production-oriented example',
                'code' => $topic['code'],
                'walkthrough' => 'Read the example in the same order as the mechanism steps. Identify the immutable input, security boundary, failure path, and evidence retained for verification.',
                'expectedResult' => 'The operation is reproducible, least-privileged, observable, and recoverable under the scenario constraints.',
            ]],
            'glossary' => array_map(fn (array $claim): array => ['term' => $claim[0], 'definition' => 'Required evidence: '.implode(', ', $claim[1]).'.'], $topic['claims']),
            'verificationChecklist' => [$failure['prevention'], $failure['monitoring'], 'Test the recovery path before relying on it during an incident.'],
            'reviewStatus' => 'automated_verified',
            'reviewedAt' => config('curriculum_sources.reviewed_at'),
        ];
    }

    private function modelAnswer(array $topic): string
    {
        $failure = $topic['failure'];
        $steps = implode(' ', array_map(
            fn (string $step, int $index): string => 'First' === ($label = match ($index) {
                0 => 'First', 1 => 'Second', 2 => 'Third', default => 'Finally'
            })
                ? "{$label}, {$step}."
                : "{$label}, {$step}.",
            $topic['mechanism'], array_keys($topic['mechanism']),
        ));
        $evidence = implode('; ', array_map(fn (array $claim): string => $claim[0].' is demonstrated by '.implode(' and ', $claim[1]), $topic['claims']));

        return $topic['summary']."\n\n".
            $topic['definition'].' In this scenario, '.$topic['scenario']."\n\n".
            $steps.' The design decision is explicit: '.$topic['use'].' '.$topic['avoid']."\n\n".
            'The principal failure analysis is also explicit. '.$failure['cause'].' The operational symptom is '.$failure['symptom'].' Prevent it by '.$failure['prevention'].' If prevention fails, '.$failure['recovery'].' Engineers should verify the result by monitoring '.$failure['monitoring']."\n\n".
            'The answer is complete only when its evidence can be traced: '.$evidence.'. The team should test the happy path, the named failure, and the recovery operation against the exact revision or artifact used in production. This connects the mechanism to an observable result instead of treating the tool as a checklist item.';
    }

    private function linkSources(string $lessonId, string $conceptId, array $keys): array
    {
        $sourceIds = [];
        foreach ($keys as $index => $key) {
            $sourceId = DB::table('content_sources')->where('source_key', $key)->value('id');
            if (! $sourceId) {
                throw new RuntimeException("Missing curriculum source: {$key}");
            }
            $sourceIds[] = $sourceId;
            foreach ([['lesson', $lessonId], ['concept', $conceptId]] as [$type, $resourceId]) {
                DB::table('content_source_links')->updateOrInsert([
                    'content_source_id' => $sourceId, 'resource_type' => $type, 'resource_id' => $resourceId,
                ], ['is_primary' => $index === 0, 'created_at' => now(), 'updated_at' => now()]);
            }
        }

        return $sourceIds;
    }

    private function upsertRubricAndClaims(string $lessonId, string $conceptId, array $claims, array $sourceIds): void
    {
        foreach ($claims as $position => [$label, $evidence]) {
            $criterion = DB::table('rubric_criteria')->where('lesson_id', $lessonId)->where('position', $position)->first();
            $criterionId = $criterion?->id ?? (string) Str::ulid();
            $weight = intdiv(100, count($claims));
            DB::table('rubric_criteria')->updateOrInsert(['lesson_id' => $lessonId, 'position' => $position], [
                'id' => $criterionId, 'label' => $label,
                'description' => "Explain {$label} and connect it to the production scenario, failure handling, and verification evidence.",
                'terms' => json_encode($evidence, JSON_THROW_ON_ERROR),
                'evidence_groups' => json_encode([$evidence], JSON_THROW_ON_ERROR),
                'weight' => $weight, 'created_at' => $criterion?->created_at ?? now(), 'updated_at' => now(),
            ]);

            $claimKey = 'delivery-'.($position + 1);
            $claim = DB::table('concept_claims')->where('concept_id', $conceptId)->where('claim_key', $claimKey)->first();
            $claimId = $claim?->id ?? (string) Str::ulid();
            DB::table('concept_claims')->updateOrInsert(['concept_id' => $conceptId, 'claim_key' => $claimKey], [
                'id' => $claimId, 'statement' => "A strong answer explains {$label} with production evidence.",
                'evidence_groups' => json_encode([$evidence], JSON_THROW_ON_ERROR), 'position' => $position,
                'created_at' => $claim?->created_at ?? now(), 'updated_at' => now(),
            ]);
            DB::table('rubric_criterion_claim')->updateOrInsert(['rubric_criterion_id' => $criterionId, 'concept_claim_id' => $claimId]);
            foreach ($sourceIds as $sourceId) {
                $source = DB::table('content_sources')->where('id', $sourceId)->first();
                DB::table('concept_claim_source')->updateOrInsert([
                    'concept_claim_id' => $claimId, 'content_source_id' => $sourceId,
                ], [
                    'section_locator' => $source->section_locator,
                    'support_note' => "Supports the {$label} claim for this delivery-engineering lesson.",
                    'verified_at' => now(),
                ]);
            }
        }
    }

    private function upsertVisual(string $lessonId, array $topic): void
    {
        $nodes = collect($topic['mechanism'])->values()->map(fn (string $label, int $index): array => [
            'id' => 'step-'.($index + 1), 'label' => $label, 'group' => $index === 0 ? 'input' : ($index === 3 ? 'outcome' : 'process'),
        ])->all();
        $edges = collect($nodes)->slice(0, -1)->values()->map(fn (array $node, int $index): array => [
            'from' => $node['id'], 'to' => $nodes[$index + 1]['id'], 'label' => match ($index) {
                0 => 'produces', 1 => 'qualifies', default => 'verifies'
            },
        ])->all();
        $data = ['nodes' => $nodes, 'edges' => $edges, 'annotations' => [['label' => 'Failure boundary', 'text' => $topic['failure']['symptom']]]];
        $fingerprint = hash('sha256', $topic['key'].json_encode($data, JSON_THROW_ON_ERROR));
        $visual = DB::table('lesson_visuals')->where('lesson_id', $lessonId)->first();

        DB::table('lesson_visuals')->updateOrInsert(['lesson_id' => $lessonId, 'position' => 0], [
            'id' => $visual?->id ?? (string) Str::ulid(), 'kind' => $topic['visual'], 'schema_version' => 2,
            'layout' => $topic['visual'], 'title' => $topic['title'].' data flow',
            'caption' => 'Trace the topic-specific production mechanism and the boundary where evidence is verified.',
            'alt_text' => 'A '.$topic['visual'].' diagram for '.$topic['title'].' with four ordered, labeled steps and a failure annotation.',
            'data' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), 'fingerprint' => $fingerprint,
            'created_at' => $visual?->created_at ?? now(), 'updated_at' => now(),
        ]);
    }

    private function upsertReview(string $type, string $id, string $content): void
    {
        $review = DB::table('content_reviews')->where('resource_type', $type)->where('resource_id', $id)->first();
        DB::table('content_reviews')->updateOrInsert(['resource_type' => $type, 'resource_id' => $id], [
            'id' => $review?->id ?? (string) Str::ulid(), 'status' => 'automated_verified',
            'reviewer_id' => null, 'content_hash' => hash('sha256', $content),
            'notes' => 'Schema v3 validation and source linkage completed. Human editorial review remains required.',
            'reviewed_at' => now(), 'created_at' => $review?->created_at ?? now(), 'updated_at' => now(),
        ]);
    }

    private function upsertProjects(): void
    {
        $projects = [
            ['delivery', 'Deliver Backend Lab using Docker and GitHub Actions', 'Containerize the application and design a secure build-once delivery pipeline with quality gates, attestations, health checks, and rollback.'],
            ['redis-incident', 'Diagnose a Redis and Queue Overload Incident', 'Restore a saturated asynchronous system, explain cache and queue coupling, apply backpressure, and produce a prevention runbook.'],
            ['secure-api', 'Secure a Multi-tenant API and Credential Lifecycle', 'Implement identity, tenant-safe authorization, validation, secret rotation, audit evidence, and incident recovery.'],
            ['transactional-database', 'Design and Optimize a Transactional Ordering Database', 'Design normalized order data, choose indexes from query plans, preserve transaction invariants, and diagnose lock contention.'],
        ];
        foreach ($projects as [$key, $title, $description]) {
            $legacyKey = 'pro:'.$key;
            $project = DB::table('projects')->where('legacy_key', $legacyKey)->first();
            DB::table('projects')->updateOrInsert(['legacy_key' => $legacyKey], [
                'id' => $project?->id ?? (string) Str::ulid(), 'slug' => $key, 'title' => $title,
                'description' => $description,
                'content' => json_encode([
                    'objective' => $description,
                    'requirements' => ['Document constraints and invariants.', 'Implement the main path and a realistic failure path.', 'Add automated security and recovery tests.', 'Expose operational metrics and write a concise runbook.'],
                    'deliverables' => ['Architecture decision record', 'Working implementation', 'Automated tests', 'Operational dashboard', 'Recovery runbook'],
                    'reviewQuestions' => ['What is authoritative?', 'Which operation can be retried safely?', 'How is access constrained?', 'Which signal proves recovery?'],
                ], JSON_THROW_ON_ERROR),
                'created_at' => $project?->created_at ?? now(), 'updated_at' => now(),
            ]);
        }
    }

    private function validateTopics(array $topics): void
    {
        if (count($topics) !== 12) {
            throw new RuntimeException('Delivery curriculum must contain exactly 12 topics.');
        }
        foreach ($topics as $topic) {
            foreach (['key', 'title', 'summary', 'definition', 'scenario', 'question', 'mechanism', 'failure', 'code', 'sources', 'claims'] as $field) {
                if (empty($topic[$field])) {
                    throw new RuntimeException("Delivery topic is missing {$field}.");
                }
            }
            if (count($topic['mechanism']) !== 4 || count($topic['claims']) !== 4 || count($topic['sources']) < 2) {
                throw new RuntimeException("Delivery topic {$topic['key']} has an invalid content shape.");
            }
        }
    }
}
