<?php

namespace Database\Seeders;

use App\Domain\Curriculum\EnglishText;
use App\Domain\Curriculum\InterviewContentRevision;
use App\Models\Lesson;
use App\Models\Track;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

final class SoftwareEngineeringCurriculumSeeder extends Seeder
{
    public const TRACKS = 8;

    public const LESSONS = 70;

    public const CONCEPTS = 70;

    public function run(): void
    {
        $tracks = $this->curriculum();
        $lessonCount = array_sum(array_map(fn (array $track): int => count($track['topics']), $tracks));
        if (count($tracks) !== self::TRACKS || $lessonCount !== self::LESSONS) {
            throw new RuntimeException('Software-engineering curriculum count mismatch: '.count($tracks)." tracks, {$lessonCount} lessons.");
        }

        DB::transaction(function () use ($tracks): void {
            $categoryId = $this->categoryId();
            foreach ($tracks as $trackPosition => $source) {
                $track = $this->upsertTrack($source, $categoryId, 54 + $trackPosition);
                foreach ($source['topics'] as $position => $topic) {
                    $conceptId = $this->upsertConcept($source, $topic);
                    $lessonId = $this->upsertLesson($track, $source, $topic, $position);
                    DB::table('concept_lesson')->updateOrInsert([
                        'concept_id' => $conceptId,
                        'lesson_id' => $lessonId,
                    ]);
                }
            }
        });
    }

    private function curriculum(): array
    {
        $files = glob(database_path('seeders/data/software-engineering/*.php')) ?: [];
        sort($files);

        return array_map(fn (string $file): array => require $file, $files);
    }

    private function categoryId(): string
    {
        $existing = DB::table('categories')->where('slug', 'interview-curriculum')->first();
        if ($existing) {
            return $existing->id;
        }

        $id = (string) Str::ulid();
        DB::table('categories')->insert([
            'id' => $id,
            'slug' => 'interview-curriculum',
            'name' => 'Interview Curriculum',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    private function upsertTrack(array $source, string $categoryId, int $position): Track
    {
        $track = Track::firstOrNew(['legacy_key' => 'se:'.$source['slug']]);
        if (! $track->exists) {
            $track->id = (string) Str::ulid();
        }
        $track->fill([
            'category_id' => $categoryId,
            'slug' => 'software-engineering-'.$source['slug'],
            'title' => $source['title'],
            'title_ar' => null,
            'description' => "Develop production-ready knowledge of {$source['title']} through mechanisms, trade-offs, failure analysis, and verification.",
            'color' => $source['color'],
            'icon' => $source['icon'],
            'position' => $position,
        ])->save();

        return $track;
    }

    private function upsertConcept(array $track, array $topic): string
    {
        $revision = app(InterviewContentRevision::class);
        $legacyKey = 'se:'.$track['slug'].':'.$topic['slug'];
        $existing = DB::table('concepts')->where('legacy_key', $legacyKey)->first();
        $id = $existing?->id ?? (string) Str::ulid();
        $criteria = $this->criteria($topic);
        $content = [
            'schemaVersion' => 2,
            'summary' => "{$topic['title']} should be selected from production constraints, not from technology preference.",
            'definition' => $revision->modelAnswer($topic['answer'], $topic['definition'], $topic['example'], $topic['pitfall'], $criteria, $topic['title']),
            'mechanism' => "Define the system boundary and invariant, apply {$topic['title']} at that boundary, handle failure explicitly, and verify the outcome with tests and production signals.",
            'whenToUse' => ["Use {$topic['title']} when its guarantees directly satisfy a documented production requirement."],
            'whenNotToUse' => ["Avoid {$topic['title']} when a simpler implementation satisfies the same correctness, scale, and security requirements."],
            'useCases' => ['Apply it to the linked production interview scenario and make the operational decision explicit.'],
            'tradeOffs' => ['Account for implementation complexity, failure recovery, observability, and ongoing operational cost.'],
            'codeExamples' => [[
                'language' => isset($topic['code']) ? 'php' : 'text',
                'label' => isset($topic['code']) ? 'Implementation example' : 'Decision checklist',
                'code' => $topic['code'] ?? $this->decisionChecklist($topic),
                'walkthrough' => 'Read the example from boundary to outcome. Identify the invariant, the failure path, and the observable verification step.',
            ]],
        ];
        DB::table('concepts')->updateOrInsert(['legacy_key' => $legacyKey], [
            'id' => $id,
            'slug' => 'se-'.$track['slug'].'-'.$topic['slug'],
            'title' => $topic['title'],
            'group_name' => $track['title'],
            'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            'created_at' => $existing?->created_at ?? now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    private function upsertLesson(Track $track, array $trackSource, array $topic, int $position): string
    {
        $revision = app(InterviewContentRevision::class);
        $criteria = $this->criteria($topic);
        $legacyKey = 'se:'.$trackSource['slug'].':'.$topic['slug'];
        $lesson = Lesson::firstOrNew(['legacy_key' => $legacyKey]);
        if (! $lesson->exists) {
            $lesson->id = (string) Str::ulid();
        }
        $lesson->fill([
            'track_id' => $track->id,
            'slug' => $topic['slug'],
            'title' => $topic['title'],
            'objective' => $revision->objective($topic['title'], null, $criteria),
            'explanation' => $revision->explanation($topic['title'], $topic['question'], $topic['answer'], $criteria),
            'plain_explanation' => null,
            'practical_example' => $revision->practicalExample($topic['title'], $topic['question'], $topic['example']),
            'interview_question' => $revision->question($topic['title'], $topic['question'], $criteria),
            'model_answer' => $revision->modelAnswer($topic['answer'], $topic['definition'], $topic['example'], $topic['pitfall'], $criteria, $topic['title']),
            'code' => $topic['code'] ?? null,
            'common_mistake' => null,
            'pitfall' => $revision->pitfall($topic['title'], $topic['pitfall']),
            'position' => $position,
        ])->save();

        DB::table('rubric_criteria')->where('lesson_id', $lesson->id)->delete();
        foreach ($criteria as $index => $criterion) {
            DB::table('rubric_criteria')->insert([
                'id' => (string) Str::ulid(),
                'lesson_id' => $lesson->id,
                'label' => $criterion['label'],
                'description' => $criterion['description'],
                'terms' => json_encode($criterion['terms'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'evidence_groups' => json_encode($criterion['evidence_groups'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'weight' => $criterion['weight'],
                'position' => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $lesson->id;
    }

    private function criteria(array $topic): array
    {
        $english = app(EnglishText::class);
        $terms = array_values(array_filter(array_map(fn (string $term): string => $english->clean($term), $topic['terms'])));

        return [
            $this->criterion('Definition and mechanism', 'Define the mechanism and explain how it preserves the required invariant.', array_slice($terms, 0, 3), 4),
            $this->criterion('Context and trade-offs', 'Connect the choice to the scenario and compare its meaningful costs and alternatives.', $terms, 3),
            $this->criterion('Failure handling and verification', 'Name a realistic failure mode and explain how tests or monitoring prove the design works.', array_values(array_unique(array_merge(array_slice($terms, -2), ['failure', 'monitoring']))), 3),
        ];
    }

    private function criterion(string $label, string $description, array $terms, int $weight): array
    {
        return [
            'label' => $label,
            'description' => $description,
            'terms' => $terms,
            'evidence_groups' => array_map(fn (string $term): array => [$term], $terms),
            'weight' => $weight,
        ];
    }

    private function decisionChecklist(array $topic): string
    {
        return "1. What production problem are we solving?\n2. Which invariant, boundary, and constraints matter?\n3. Why is this design better than the simplest alternative?\n4. How will failure and recovery be tested?\n5. Which production signal proves the outcome?\n\nRequired terms: ".implode(', ', $topic['terms']);
    }
}
