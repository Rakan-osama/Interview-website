<?php

namespace App\Console\Commands;

use App\Infrastructure\AI\DeterministicRubricEvaluator;
use App\Models\Lesson;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Throwable;

final class AuditCurriculum extends Command
{
    private const APPROVED_SOURCE_HOSTS = [
        'abseil.io',
        'cheatsheetseries.owasp.org',
        'dev.mysql.com',
        'docs.docker.com',
        'docs.github.com',
        'git-scm.com',
        'kubernetes.io',
        'laravel.com',
        'owasp.org',
        'redis.io',
        'refactoring.guru',
        'sre.google',
        'www.php.net',
        'www.postgresql.org',
        'www.rfc-editor.org',
    ];

    protected $signature = 'curriculum:audit {--links : Send requests to every source URL}';

    protected $description = 'Validate curriculum counts, schema v3 content, evidence, sources, diagrams, and canonical answers.';

    public function handle(DeterministicRubricEvaluator $evaluator): int
    {
        $failures = [];
        $this->expectCount($failures, 'tracks', 63);
        $this->expectCount($failures, 'lessons', 432);
        $this->expectCount($failures, 'concepts', 184);
        $this->expectCount($failures, 'competencies', 4);
        $this->expectCount($failures, 'feature_guides', 16);
        $this->expectCount($failures, 'resources', 12);
        $this->expectCount($failures, 'projects', 7);

        $schemaV3 = DB::table('concepts')->where('content', 'like', '%"schemaVersion":3%')->count();
        if ($schemaV3 !== 184) {
            $failures[] = "Expected 184 schema-v3 concepts; found {$schemaV3}.";
        }
        $placeholders = DB::table('concepts')->where('content', 'like', '%Decision pseudocode%')->count();
        if ($placeholders > 0) {
            $failures[] = "Found {$placeholders} placeholder pseudocode records.";
        }
        $this->auditSources($failures);
        $this->auditClaims($failures);
        $this->auditVisuals($failures);
        $this->auditCanonicalContent($failures, $evaluator);
        $this->auditDeliveryContent($failures, $evaluator);
        $this->auditExactParagraphDuplicates($failures);
        if ($this->option('links')) {
            $this->auditLinks($failures);
        }

        if ($failures !== []) {
            foreach ($failures as $failure) {
                $this->error($failure);
            }
            $this->error('Curriculum audit failed with '.count($failures).' issue(s).');

            return self::FAILURE;
        }
        $this->info('Curriculum audit passed: 63 tracks, 432 lessons, 184 concepts, 4 competency hubs, and 7 projects.');

        return self::SUCCESS;
    }

    private function expectCount(array &$failures, string $table, int $expected): void
    {
        $actual = DB::table($table)->count();
        if ($actual !== $expected) {
            $failures[] = "Expected {$expected} records in {$table}; found {$actual}.";
        }
    }

    private function auditSources(array &$failures): void
    {
        $missing = DB::table('lessons')->whereNotExists(function ($query): void {
            $query->selectRaw('1')->from('content_source_links')
                ->whereColumn('content_source_links.resource_id', 'lessons.id')
                ->where('content_source_links.resource_type', 'lesson')
                ->groupBy('content_source_links.resource_id')->havingRaw('COUNT(*) >= 2');
        })->count();
        if ($missing > 0) {
            $failures[] = "{$missing} lessons have fewer than two linked sources.";
        }
        foreach (DB::table('content_sources')->get() as $source) {
            $host = parse_url($source->url, PHP_URL_HOST);
            if (! is_string($host) || $host === '' || ! $source->section_locator || ! $source->applicable_version || ! $source->reviewed_at) {
                $failures[] = "Source {$source->source_key} has incomplete metadata.";
            } elseif (! in_array(mb_strtolower($host), self::APPROVED_SOURCE_HOSTS, true)) {
                $failures[] = "Source {$source->source_key} uses unapproved host {$host}.";
            }
        }
    }

    private function auditClaims(array &$failures): void
    {
        $missingSources = DB::table('concept_claims')->whereNotExists(function ($query): void {
            $query->selectRaw('1')->from('concept_claim_source')
                ->whereColumn('concept_claim_source.concept_claim_id', 'concept_claims.id');
        })->count();
        if ($missingSources > 0) {
            $failures[] = "{$missingSources} canonical claims have no direct source linkage.";
        }
        $missingRubric = DB::table('rubric_criteria')->whereNotExists(function ($query): void {
            $query->selectRaw('1')->from('rubric_criterion_claim')
                ->whereColumn('rubric_criterion_claim.rubric_criterion_id', 'rubric_criteria.id');
        })->count();
        if ($missingRubric > 0) {
            $failures[] = "{$missingRubric} rubric criteria are not linked to claims.";
        }
    }

    private function auditVisuals(array &$failures): void
    {
        $duplicates = DB::table('lesson_visuals')->select('fingerprint')->whereNotNull('fingerprint')
            ->groupBy('fingerprint')->havingRaw('COUNT(*) > 1')->get();
        if ($duplicates->isNotEmpty()) {
            $failures[] = $duplicates->count().' diagram fingerprints are duplicated.';
        }
        $invalid = DB::table('lesson_visuals')->where(function ($query): void {
            $query->whereNull('caption')->orWhere('caption', '')->orWhereNull('alt_text')->orWhere('alt_text', '');
        })->count();
        if ($invalid > 0) {
            $failures[] = "{$invalid} diagrams are missing a caption or text alternative.";
        }
    }

    private function auditDeliveryContent(array &$failures, DeterministicRubricEvaluator $evaluator): void
    {
        $lessons = Lesson::query()->with('criteria')->whereHas('track', fn ($query) => $query->where('legacy_key', 'se:delivery-engineering'))->get();
        if ($lessons->count() !== 12) {
            $failures[] = 'The delivery-engineering track must contain exactly 12 lessons.';

            return;
        }
        foreach ($lessons as $lesson) {
            $words = str_word_count(strip_tags($lesson->model_answer));
            if ($words < 250 || $words > 450) {
                $failures[] = "{$lesson->title} model answer has {$words} words; expected 250-450.";
            }
            if ($evaluator->evaluate($lesson, $lesson->model_answer)->overallScore !== 100) {
                $failures[] = "{$lesson->title} does not score 100 against its own deterministic rubric.";
            }
        }
    }

    private function auditCanonicalContent(array &$failures, DeterministicRubricEvaluator $evaluator): void
    {
        foreach (DB::table('concepts')->get(['legacy_key', 'content']) as $concept) {
            $content = json_decode($concept->content, true, flags: JSON_THROW_ON_ERROR);
            $summaryWords = str_word_count($content['summary'] ?? '');
            if ($summaryWords < 25 || $summaryWords > 45) {
                $failures[] = "{$concept->legacy_key} summary has {$summaryWords} words; expected 25-45.";
            }
            $questions = $content['guidedQuestions'] ?? [];
            if (count($questions) < 4 || count($questions) > 7) {
                $failures[] = "{$concept->legacy_key} must contain four to seven guided questions.";
            }
            foreach ($questions as $index => $question) {
                $answerWords = str_word_count($question['answer'] ?? '');
                if ($answerWords < 70) {
                    $failures[] = "{$concept->legacy_key} guided answer ".($index + 1)." has {$answerWords} words; expected at least 70.";
                }
            }
        }

        foreach (Lesson::query()->with('criteria')->get() as $lesson) {
            $words = str_word_count(strip_tags($lesson->model_answer));
            if ($words < 250 || $words > 450) {
                $failures[] = "{$lesson->legacy_key} model answer has {$words} words; expected 250-450.";
            }
            if ($evaluator->evaluate($lesson, $lesson->model_answer)->overallScore !== 100) {
                $failures[] = "{$lesson->legacy_key} model answer does not score 100 against its own rubric.";
            }
        }
    }

    private function auditExactParagraphDuplicates(array &$failures): void
    {
        $seen = [];
        $duplicateExamples = [];
        foreach (DB::table('lessons')->get(['id', 'explanation']) as $lesson) {
            foreach (preg_split('/\R{2,}/u', $lesson->explanation) ?: [] as $paragraph) {
                $normalized = preg_replace('/\s+/u', ' ', mb_strtolower(trim($paragraph))) ?? '';
                if (mb_strlen($normalized) < 100) {
                    continue;
                }
                $hash = hash('sha256', $normalized);
                if (isset($seen[$hash]) && $seen[$hash] !== $lesson->id) {
                    $duplicateExamples[] = "{$seen[$hash]} and {$lesson->id}";
                }
                $seen[$hash] = $lesson->id;
            }
        }
        if ($duplicateExamples !== []) {
            $failures[] = 'Found '.count($duplicateExamples).' exact long-paragraph duplicates across lessons: '.implode(', ', array_slice($duplicateExamples, 0, 5)).'.';
        }
    }

    private function auditLinks(array &$failures): void
    {
        foreach (DB::table('content_sources')->get(['source_key', 'url']) as $source) {
            try {
                $response = Http::timeout(15)->retry(2, 250, null, false)->get($source->url);
                if ($response->status() >= 400 && $response->status() !== 403) {
                    $failures[] = "Source link {$source->source_key} returned HTTP {$response->status()}.";
                } elseif ($response->status() === 403) {
                    $this->warn("Source link {$source->source_key} is reachable but blocks automated clients with HTTP 403.");
                }
            } catch (Throwable $exception) {
                $failures[] = "Source link {$source->source_key} failed: {$exception->getMessage()}";
            }
        }
    }
}
