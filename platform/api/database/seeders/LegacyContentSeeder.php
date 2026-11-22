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

class LegacyContentSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(database_path('seeders/data/legacy-content.json')), true, flags: JSON_THROW_ON_ERROR);
        $this->assertCounts($data);

        DB::transaction(function () use ($data): void {
            $categoryId = $this->upsertCategory();
            $conceptIds = $this->upsertConcepts($data['concepts']);
            $this->upsertTracks($data, $categoryId, $conceptIds);
            $this->upsertGuides($data['guides']);
            $this->upsertResources($data['resources']);
            $this->upsertProjects($data['projects']);
        });
    }

    private function upsertCategory(): string
    {
        $row = DB::table('categories')->where('slug', 'interview-curriculum')->first();
        if ($row) {
            return $row->id;
        }
        $id = (string) Str::ulid();
        DB::table('categories')->insert(['id' => $id, 'slug' => 'interview-curriculum', 'name' => 'Interview Curriculum', 'created_at' => now(), 'updated_at' => now()]);

        return $id;
    }

    private function upsertConcepts(array $concepts): array
    {
        $english = app(EnglishText::class);
        $ids = [];
        foreach ($concepts as $concept) {
            $existing = DB::table('concepts')->where('legacy_key', $concept['id'])->first();
            $id = $existing?->id ?? (string) Str::ulid();
            $title = $english->title($concept['title'] ?? null, $concept['id']);
            $content = [
                'schemaVersion' => 2,
                'summary' => "{$title} is a production engineering concept that must be understood through its behavior, boundary, and trade-offs.",
                'definition' => "{$title} describes a specific mechanism or decision used to preserve correctness, reliability, security, or maintainability in a software system.",
                'mechanism' => "Start with the system boundary and invariant, apply {$title} at the correct layer, handle its failure path explicitly, and verify the observable result.",
                'whenToUse' => ["Use {$title} when its guarantees match a documented production constraint."],
                'whenNotToUse' => ["Do not add {$title} when a simpler design already satisfies the required guarantees."],
                'useCases' => ['Use the linked interview lessons to study concrete production scenarios.'],
                'tradeOffs' => ['Every added mechanism creates operational and testing cost; justify that cost with a measurable requirement.'],
                'codeExamples' => [],
            ];
            DB::table('concepts')->updateOrInsert(['legacy_key' => $concept['id']], [
                'id' => $id, 'slug' => Str::slug($concept['id']), 'title' => $title,
                'group_name' => $english->title($concept['group'] ?? null, 'Core concepts'), 'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'created_at' => $existing?->created_at ?? now(), 'updated_at' => now(),
            ]);
            $ids[$concept['id']] = $id;
        }

        return $ids;
    }

    private function upsertTracks(array $data, string $categoryId, array $conceptIds): void
    {
        foreach ($data['tracks'] as $trackIndex => $sourceTrack) {
            $legacy = (string) $trackIndex;
            $track = Track::firstOrNew(['legacy_key' => $legacy]);
            if (! $track->exists) {
                $track->id = (string) Str::ulid();
            }
            $track->fill([
                'category_id' => $categoryId, 'slug' => Str::slug($sourceTrack['title']).'-'.$trackIndex,
                'title' => $sourceTrack['title'], 'title_ar' => null,
                'description' => "Practice production interview scenarios for {$sourceTrack['title']}, from the underlying mechanism to trade-offs, failure handling, and verification.",
                'color' => $sourceTrack['color'], 'icon' => $sourceTrack['icon'], 'position' => $trackIndex,
            ])->save();
            foreach ($sourceTrack['questions'] as $questionIndex => $question) {
                $this->upsertLesson($track, $question, "$trackIndex-$questionIndex", $questionIndex, $data['plainExplanations'], $conceptIds);
            }
        }
    }

    private function upsertLesson(Track $track, array $question, string $legacy, int $position, array $plain, array $conceptIds): void
    {
        $revision = app(InterviewContentRevision::class);
        $english = app(EnglishText::class);
        $title = $english->title($question['title'] ?? null, $legacy);
        $practicalExample = $revision->practicalExample(
            $title,
            $question['question'],
            $question['practicalExample'] ?? $this->plainField($question, $plain, 'example'),
        );
        $lesson = Lesson::firstOrNew(['legacy_key' => $legacy]);
        if (! $lesson->exists) {
            $lesson->id = (string) Str::ulid();
        }
        $lesson->fill([
            'track_id' => $track->id, 'slug' => Str::slug($title).'-'.$position, 'title' => $title,
            'objective' => $revision->objective($title, $question['deliverable'] ?? null, $question['criteria']),
            'explanation' => $revision->explanation($title, $question['question'], $question['model'], $question['criteria']),
            'plain_explanation' => null,
            'practical_example' => $practicalExample,
            'interview_question' => $revision->question($title, $question['question'], $question['criteria']),
            'model_answer' => $revision->modelAnswer($question['model'], $question['lesson'], $practicalExample, $question['pitfall'], $question['criteria'], $title),
            'code' => $english->containsArabic($question['code'] ?? null) ? null : ($question['code'] ?? null),
            'reference_solution' => $english->usable($question['solution'] ?? null), 'common_mistake' => null,
            'pitfall' => $revision->pitfall($title, $question['pitfall'] ?? null), 'position' => $position,
        ])->save();
        DB::table('rubric_criteria')->where('lesson_id', $lesson->id)->delete();
        foreach ($question['criteria'] as $index => $criterion) {
            $terms = array_values(array_filter(array_map(fn (string $term): string => $english->clean($term), $criterion['terms'] ?? [])));
            $label = $english->title($criterion['label'] ?? null, "criterion-{$index}");
            DB::table('rubric_criteria')->insert([
                'id' => (string) Str::ulid(), 'lesson_id' => $lesson->id, 'label' => $label,
                'description' => "Explain {$label} in the scenario, include the decision it supports, and provide observable verification.",
                'terms' => json_encode($terms, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'evidence_groups' => json_encode(array_map(fn (string $term): array => [$term], $terms), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'weight' => 1, 'position' => $index, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        $links = array_values(array_intersect_key($conceptIds, array_flip($question['conceptIds'] ?? [])));
        DB::table('concept_lesson')->where('lesson_id', $lesson->id)->delete();
        foreach ($links as $conceptId) {
            DB::table('concept_lesson')->insert(['concept_id' => $conceptId, 'lesson_id' => $lesson->id]);
        }
    }

    private function plainField(array $question, array $plain, string $field): ?string
    {
        foreach ($question['conceptIds'] ?? [] as $conceptId) {
            if (! empty($plain[$conceptId][$field])) {
                return $plain[$conceptId][$field];
            }
        }

        return null;
    }

    private function upsertGuides(array $guides): void
    {
        foreach ($guides as $guide) {
            $existing = DB::table('feature_guides')->where('legacy_key', $guide['id'])->first();
            $id = $existing?->id ?? (string) Str::ulid();
            DB::table('feature_guides')->updateOrInsert(['legacy_key' => $guide['id']], [
                'id' => $id, 'slug' => Str::slug($guide['id']), 'title' => $guide['title'], 'domain' => $guide['domain'],
                'summary' => $guide['summary'], 'simulator_key' => $guide['sim'], 'created_at' => $existing?->created_at ?? now(), 'updated_at' => now(),
            ]);
            DB::table('guide_sections')->where('feature_guide_id', $id)->delete();
            $position = 0;
            foreach (['chapters', 'entities', 'states', 'flow', 'failures', 'api', 'tests', 'workshop', 'sources'] as $type) {
                foreach ($guide[$type] as $section) {
                    DB::table('guide_sections')->insert([
                        'id' => (string) Str::ulid(), 'feature_guide_id' => $id, 'type' => $type,
                        'title' => is_array($section) ? ($section['title'] ?? null) : null,
                        'content' => json_encode($section, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                        'position' => $position++, 'created_at' => now(), 'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    private function upsertResources(array $resources): void
    {
        foreach ($resources as $index => $resource) {
            DB::table('resources')->updateOrInsert(['legacy_key' => (string) $index], [
                'id' => DB::table('resources')->where('legacy_key', (string) $index)->value('id') ?? (string) Str::ulid(),
                'slug' => 'resource-'.$index, 'title' => $resource['title'], 'type' => $resource['type'] ?? null,
                'url' => $resource['url'] ?? null, 'description' => json_encode($resource, JSON_UNESCAPED_UNICODE), 'updated_at' => now(), 'created_at' => now(),
            ]);
        }
    }

    private function upsertProjects(array $projects): void
    {
        foreach ($projects as $index => $project) {
            DB::table('projects')->updateOrInsert(['legacy_key' => (string) $index], [
                'id' => DB::table('projects')->where('legacy_key', (string) $index)->value('id') ?? (string) Str::ulid(),
                'slug' => 'project-'.$index, 'title' => $project['title'], 'description' => $project['summary'] ?? null,
                'content' => json_encode($project, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), 'updated_at' => now(), 'created_at' => now(),
            ]);
        }
    }

    private function assertCounts(array $data): void
    {
        $actual = ['tracks' => count($data['tracks']), 'exercises' => array_sum(array_map(fn ($track) => count($track['questions']), $data['tracks'])), 'concepts' => count($data['concepts']), 'guides' => count($data['guides'])];
        if ($actual !== $data['expected']) {
            throw new RuntimeException('Legacy content count mismatch: '.json_encode($actual));
        }
    }
}
