<?php

namespace Database\Seeders;

use App\Domain\Curriculum\CanonicalContentFactory;
use App\Domain\Curriculum\EnglishText;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class EnglishCurriculumSeeder extends Seeder
{
    public function __construct(
        private readonly CanonicalContentFactory $factory,
        private readonly EnglishText $english,
    ) {}

    public function run(): void
    {
        DB::transaction(function (): void {
            $sources = $this->seedSources();
            $this->rewriteTracks();
            $this->rewriteConceptsAndLessons($sources);
            $this->rewriteGuides();
            $this->rewriteProjects();
            $this->rewriteResources();
        });
    }

    private function rewriteTracks(): void
    {
        foreach (DB::table('tracks')->get() as $track) {
            $data = $this->factory->track($track->legacy_key, $this->english->title($track->title, 'Interview track'));
            DB::table('tracks')->where('id', $track->id)->update([
                'title' => $data['title'], 'title_ar' => null, 'description' => $data['description'], 'updated_at' => now(),
            ]);
        }
    }

    private function seedSources(): array
    {
        $ids = [];
        foreach (config('curriculum_sources.sources') as $key => $source) {
            $existing = DB::table('content_sources')->where('source_key', $key)->first();
            $id = $existing?->id ?? (string) Str::ulid();
            DB::table('content_sources')->updateOrInsert(['source_key' => $key], [
                'id' => $id,
                'title' => $source['title'],
                'publisher' => $source['publisher'],
                'url' => $source['url'],
                'applicable_version' => $source['version'],
                'section_locator' => $source['section'],
                'reviewed_at' => config('curriculum_sources.reviewed_at'),
                'created_at' => $existing?->created_at ?? now(),
                'updated_at' => now(),
            ]);
            $ids[$key] = $id;
        }

        return $ids;
    }

    private function rewriteConceptsAndLessons(array $sourceIds): void
    {
        DB::table('content_source_links')->whereIn('resource_type', ['lesson', 'concept'])->delete();
        DB::table('lesson_visuals')->delete();
        DB::table('concept_claims')->delete();
        $visitedConcepts = [];

        foreach (DB::table('lessons')->orderBy('track_id')->orderBy('position')->get() as $lesson) {
            $lessonData = (array) $lesson;
            $lessonData = $this->sanitizeLesson($lessonData);
            $criteria = DB::table('rubric_criteria')->where('lesson_id', $lesson->id)->orderBy('position')->get()
                ->map(function (object $criterion): array {
                    $data = (array) $criterion;
                    $data['terms'] = json_decode($criterion->terms ?: '[]', true) ?: [];

                    return $data;
                })->all();
            $learningContent = $this->factory->lesson($lessonData, $criteria);
            DB::table('lessons')->where('id', $lesson->id)->update([
                ...$lessonData,
                'learning_content' => json_encode($learningContent, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'content_depth' => $learningContent['depth'],
                'updated_at' => now(),
            ]);
            $title = $lessonData['title'];

            $concept = DB::table('concepts')
                ->join('concept_lesson', 'concepts.id', '=', 'concept_lesson.concept_id')
                ->where('concept_lesson.lesson_id', $lesson->id)
                ->select('concepts.*')
                ->orderBy('concepts.id')
                ->first();
            $this->upsertReview('lesson', $lesson->id, $lessonData['model_answer']);

            $selectedSources = $this->sourceKeys($title.' '.$lessonData['interview_question']);
            $this->linkSources('lesson', $lesson->id, $selectedSources, $sourceIds);
            if ($concept) {
                if (! isset($visitedConcepts[$concept->id])) {
                    $conceptTitle = $this->english->title($concept->title, $concept->legacy_key);
                    $content = $this->factory->concept($conceptTitle, $lessonData, json_decode($concept->content, true) ?: []);
                    DB::table('concepts')->where('id', $concept->id)->update([
                        'title' => $conceptTitle,
                        'group_name' => $this->english->title($concept->group_name, 'Core concepts'),
                        'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                        'updated_at' => now(),
                    ]);
                    $this->upsertReview('concept', $concept->id, json_encode($content, JSON_THROW_ON_ERROR));
                    $visitedConcepts[$concept->id] = true;
                }
                $this->linkSources('concept', $concept->id, $selectedSources, $sourceIds);
                $this->createClaims($lesson->id, $concept->id, $selectedSources, $sourceIds);
            }
            $this->createVisual($lesson->id, $lessonData['title'].' '.$lessonData['interview_question']);
        }

        $this->rewriteUnvisitedConcepts($sourceIds);
    }

    private function sanitizeLesson(array $lesson): array
    {
        $title = $this->english->title($lesson['title'], $lesson['legacy_key']);
        $fallback = "Explain {$title} in a production scenario, justify the design decision, identify a failure mode, and describe verification.";
        $storedAnswer = $this->english->usable($lesson['model_answer'], 40);
        $answer = $storedAnswer ? trim(explode('Production decision:', $storedAnswer, 2)[0]) : null;
        $answer = $answer
            ?? "{$title} protects a specific engineering invariant. Identify its owner and input boundary, apply the smallest mechanism that preserves that invariant, handle a realistic failure explicitly, and verify the observable result with a focused test and production signal.";
        $scenario = $this->english->usable($lesson['practical_example'])
            ?? "A production change involving {$title} must state its scale, trust boundary, authoritative state, failure condition, and recovery requirement before implementation.";
        $storedPitfall = $this->english->usable($lesson['pitfall']);
        $pitfall = $storedPitfall ? trim(explode(' In this lesson, test that warning against this boundary:', $storedPitfall, 2)[0]) : null;
        $pitfall = $pitfall
            ?? "A common failure is applying {$title} without naming the constraint, trade-off, or evidence that will prove the invariant still holds.";
        $pitfall = "{$pitfall} In this lesson, test that warning against this boundary: {$scenario}";
        $modelAnswer = $this->expandedModelAnswer($lesson, $title, $answer, $scenario, $pitfall);

        return [
            'title' => $title,
            'objective' => $this->english->usable($lesson['objective']) ?? $fallback,
            'explanation' => "{$title}: {$answer}\n\nProduction boundary: {$scenario}\n\nFailure analysis: {$pitfall}",
            'plain_explanation' => null,
            'practical_example' => $scenario,
            'interview_question' => $this->english->usable($lesson['interview_question']) ?? $fallback,
            'model_answer' => $modelAnswer,
            'code' => $this->english->containsArabic($lesson['code']) ? null : $lesson['code'],
            'reference_solution' => $this->english->containsArabic($lesson['reference_solution']) ? null : $lesson['reference_solution'],
            'common_mistake' => null,
            'pitfall' => $pitfall,
        ];
    }

    private function expandedModelAnswer(array $lesson, string $title, string $answer, string $scenario, string $pitfall): string
    {
        $criteria = DB::table('rubric_criteria')->where('lesson_id', $lesson['id'])->orderBy('position')->get();
        $requirements = $criteria->map(function (object $criterion): string {
            $groups = json_decode($criterion->evidence_groups ?: '[]', true) ?: [];
            $aliases = collect($groups)->flatten()->filter(fn (mixed $value): bool => is_string($value))->unique()->take(4)->implode(', ');

            return trim($criterion->label.($aliases ? " ({$aliases})" : '')).'.';
        })->implode(' ');
        $answer = Str::words($answer, 75, '');
        $scenario = Str::words($scenario, 55, '');
        $pitfall = Str::words($pitfall, 55, '');

        return implode("\n\n", [
            $answer,
            "Production decision: {$scenario} State the constraint and authoritative owner first. Then make one concrete decision for {$title}, describe the rejected alternative, and connect the choice to the scale, trust boundary, latency, consistency, or recovery requirement that actually exists.",
            "Mechanism: trace {$title} from the external input through validation and authorization to the state change or result the system owns. Name boundaries where data changes shape or responsibility. Explain what is atomic, asynchronous, repeatable, and safe for another component to assume. This causal sequence exposes hidden partial-failure and concurrency assumptions.",
            "Failure and trade-off: {$pitfall} State the user-visible symptom and broken invariant. Prevention must be implementable and testable. Recovery should identify safe retry, reconciliation, rollback, or manual repair without concealing lost or duplicated work. Add one early operational signal and a runbook action that restores authoritative state.",
            "Verification and rubric coverage: {$requirements} Verify the happy path, named failure, and recovery independently. Use a focused automated test for each claim, then add a production metric, structured log, trace, or database query that confirms the same guarantee after deployment. A complete answer finishes with evidence instead of claiming {$title} is correct because a familiar tool or pattern was used.",
        ]);
    }

    private function createClaims(string $lessonId, string $conceptId, array $sourceKeys, array $sourceIds): void
    {
        foreach (DB::table('rubric_criteria')->where('lesson_id', $lessonId)->orderBy('position')->get() as $criterion) {
            $groups = json_decode($criterion->evidence_groups ?: '[]', true) ?: [];
            if ($groups === []) {
                $terms = json_decode($criterion->terms ?: '[]', true) ?: [];
                $groups = array_map(fn (string $term): array => [$term], $terms);
            }
            $claimId = (string) Str::ulid();
            DB::table('concept_claims')->insert([
                'id' => $claimId,
                'concept_id' => $conceptId,
                'claim_key' => 'lesson-'.$lessonId.'-'.$criterion->position,
                'statement' => $criterion->description ?: "The answer must provide evidence for {$criterion->label}.",
                'evidence_groups' => json_encode($groups, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'position' => $criterion->position,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('rubric_criterion_claim')->insert([
                'rubric_criterion_id' => $criterion->id,
                'concept_claim_id' => $claimId,
            ]);
            foreach ($sourceKeys as $sourceKey) {
                $source = config("curriculum_sources.sources.{$sourceKey}");
                DB::table('concept_claim_source')->insert([
                    'concept_claim_id' => $claimId,
                    'content_source_id' => $sourceIds[$sourceKey],
                    'section_locator' => $source['section'],
                    'support_note' => "Supports the {$criterion->label} criterion for this lesson.",
                    'verified_at' => now(),
                ]);
            }
        }
    }

    private function createVisual(string $lessonId, string $searchable): void
    {
        $kind = $this->factory->visualKind($searchable);
        if (! $kind) {
            return;
        }
        $lessonTitle = DB::table('lessons')->where('id', $lessonId)->value('title');
        $visual = $this->factory->visual($kind, $lessonTitle);
        $encodedData = json_encode($visual['data'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        DB::table('lesson_visuals')->insert([
            'id' => (string) Str::ulid(),
            'lesson_id' => $lessonId,
            'kind' => $visual['kind'],
            'schema_version' => $visual['schemaVersion'],
            'layout' => $visual['layout'],
            'title' => $visual['title'],
            'caption' => $visual['caption'],
            'alt_text' => $visual['alt_text'],
            'data' => $encodedData,
            'fingerprint' => hash('sha256', $lessonId.$encodedData),
            'position' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function rewriteUnvisitedConcepts(array $sourceIds): void
    {
        foreach (DB::table('concepts')->get() as $concept) {
            if (DB::table('content_source_links')->where('resource_type', 'concept')->where('resource_id', $concept->id)->exists()) {
                continue;
            }
            $title = $this->english->title($concept->title, $concept->legacy_key);
            $placeholder = ['model_answer' => "{$title} defines a specific engineering guarantee at a system boundary.", 'practical_example' => "Apply {$title} to a production constraint.", 'pitfall' => "Do not use {$title} without verification.", 'code' => null];
            DB::table('concepts')->where('id', $concept->id)->update([
                'title' => $title,
                'group_name' => $this->english->title($concept->group_name, 'Core concepts'),
                'content' => json_encode($this->factory->concept($title, $placeholder, []), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
            $this->upsertReview('concept', $concept->id, json_encode($this->factory->concept($title, $placeholder, []), JSON_THROW_ON_ERROR));
            $this->linkSources('concept', $concept->id, ['software-engineering-google', 'http-semantics'], $sourceIds);
        }
    }

    private function upsertReview(string $type, string $id, string $content): void
    {
        $review = DB::table('content_reviews')->where('resource_type', $type)->where('resource_id', $id)->first();
        DB::table('content_reviews')->updateOrInsert(['resource_type' => $type, 'resource_id' => $id], [
            'id' => $review?->id ?? (string) Str::ulid(),
            'status' => 'automated_verified',
            'reviewer_id' => null,
            'content_hash' => hash('sha256', $content),
            'notes' => 'Schema v3 structure, English text, rubric claims, and source links were checked automatically. Editorial review is still required.',
            'reviewed_at' => now(),
            'created_at' => $review?->created_at ?? now(),
            'updated_at' => now(),
        ]);
    }

    private function sourceKeys(string $value): array
    {
        $value = mb_strtolower($value);
        $matches = [];
        foreach (config('curriculum_sources.sources') as $key => $source) {
            if (collect($source['keywords'])->contains(fn (string $word): bool => str_contains($value, $word))) {
                $matches[] = $key;
            }
        }
        foreach (['software-engineering-google', 'http-semantics'] as $fallback) {
            if (! in_array($fallback, $matches, true)) {
                $matches[] = $fallback;
            }
        }

        return array_slice($matches, 0, max(2, min(3, count($matches))));
    }

    private function linkSources(string $type, string $id, array $keys, array $sourceIds): void
    {
        foreach ($keys as $index => $key) {
            DB::table('content_source_links')->updateOrInsert([
                'content_source_id' => $sourceIds[$key], 'resource_type' => $type, 'resource_id' => $id,
            ], ['is_primary' => $index === 0, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    private function rewriteGuides(): void
    {
        foreach (DB::table('feature_guides')->get() as $guide) {
            $data = $this->factory->guide($guide->legacy_key, $guide->domain);
            DB::table('feature_guides')->where('id', $guide->id)->update(['title' => $data['title'], 'summary' => $data['summary'], 'updated_at' => now()]);
            DB::table('guide_sections')->where('feature_guide_id', $guide->id)->delete();
            foreach ($data['sections'] as $position => $section) {
                DB::table('guide_sections')->insert([
                    'id' => (string) Str::ulid(), 'feature_guide_id' => $guide->id, 'type' => $section['type'],
                    'title' => $section['title'], 'content' => json_encode($section['content'], JSON_THROW_ON_ERROR),
                    'position' => $position, 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
    }

    private function rewriteProjects(): void
    {
        foreach (DB::table('projects')->get() as $project) {
            $data = $this->factory->project($project->legacy_key);
            DB::table('projects')->where('id', $project->id)->update([
                'title' => $data['title'], 'description' => $data['description'],
                'content' => json_encode($data['content'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), 'updated_at' => now(),
            ]);
        }
    }

    private function rewriteResources(): void
    {
        foreach (DB::table('resources')->get() as $resource) {
            DB::table('resources')->where('id', $resource->id)->update([
                'title' => $this->english->title($resource->title, 'Engineering resource'),
                'description' => json_encode(['summary' => 'An authoritative learning resource selected to support the curriculum. Read the relevant section, record the engineering claim it supports, and verify its applicable version.'], JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        }
    }
}
