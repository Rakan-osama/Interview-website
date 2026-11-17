<?php

namespace Database\Seeders;

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
        if ($row) return $row->id;
        $id = (string) Str::ulid();
        DB::table('categories')->insert(['id' => $id, 'slug' => 'interview-curriculum', 'name' => 'Interview Curriculum', 'created_at' => now(), 'updated_at' => now()]);
        return $id;
    }

    private function upsertConcepts(array $concepts): array
    {
        $ids = [];
        foreach ($concepts as $concept) {
            $existing = DB::table('concepts')->where('legacy_key', $concept['id'])->first();
            $id = $existing?->id ?? (string) Str::ulid();
            DB::table('concepts')->updateOrInsert(['legacy_key' => $concept['id']], [
                'id' => $id, 'slug' => Str::slug($concept['id']), 'title' => $concept['title'],
                'group_name' => $concept['group'], 'content' => json_encode($concept, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
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
            if (! $track->exists) $track->id = (string) Str::ulid();
            $track->fill([
                'category_id' => $categoryId, 'slug' => Str::slug($sourceTrack['title']).'-'.$trackIndex,
                'title' => $sourceTrack['title'], 'title_ar' => $sourceTrack['ar'], 'description' => $sourceTrack['desc'],
                'color' => $sourceTrack['color'], 'icon' => $sourceTrack['icon'], 'position' => $trackIndex,
            ])->save();
            foreach ($sourceTrack['questions'] as $questionIndex => $question) {
                $this->upsertLesson($track, $question, "$trackIndex-$questionIndex", $questionIndex, $data['plainExplanations'], $conceptIds);
            }
        }
    }

    private function upsertLesson(Track $track, array $question, string $legacy, int $position, array $plain, array $conceptIds): void
    {
        $lesson = Lesson::firstOrNew(['legacy_key' => $legacy]);
        if (! $lesson->exists) $lesson->id = (string) Str::ulid();
        $lesson->fill([
            'track_id' => $track->id, 'slug' => Str::slug($question['title']).'-'.$position, 'title' => $question['title'],
            'objective' => $question['deliverable'] ?? null, 'explanation' => $question['lesson'],
            'plain_explanation' => $plain[$legacy]['simple'] ?? null, 'practical_example' => $plain[$legacy]['example'] ?? null,
            'interview_question' => $question['question'], 'model_answer' => $question['model'], 'code' => $question['code'] ?? null,
            'reference_solution' => $question['solution'] ?? null, 'common_mistake' => isset($question['bad']) ? implode("\n", $question['bad']) : null,
            'pitfall' => $question['pitfall'], 'position' => $position,
        ])->save();
        DB::table('rubric_criteria')->where('lesson_id', $lesson->id)->delete();
        foreach ($question['criteria'] as $index => $criterion) {
            DB::table('rubric_criteria')->insert([
                'id' => (string) Str::ulid(), 'lesson_id' => $lesson->id, 'label' => $criterion['label'],
                'terms' => json_encode($criterion['terms'], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'weight' => 1, 'position' => $index, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        $links = array_values(array_intersect_key($conceptIds, array_flip($question['conceptIds'] ?? [])));
        DB::table('concept_lesson')->where('lesson_id', $lesson->id)->delete();
        foreach ($links as $conceptId) DB::table('concept_lesson')->insert(['concept_id' => $conceptId, 'lesson_id' => $lesson->id]);
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
                foreach ($guide[$type] as $section) DB::table('guide_sections')->insert([
                    'id' => (string) Str::ulid(), 'feature_guide_id' => $id, 'type' => $type,
                    'title' => is_array($section) ? ($section['title'] ?? null) : null,
                    'content' => json_encode($section, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                    'position' => $position++, 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
    }

    private function upsertResources(array $resources): void
    {
        foreach ($resources as $index => $resource) DB::table('resources')->updateOrInsert(['legacy_key' => (string) $index], [
            'id' => DB::table('resources')->where('legacy_key', (string) $index)->value('id') ?? (string) Str::ulid(),
            'slug' => 'resource-'.$index, 'title' => $resource['title'], 'type' => $resource['type'] ?? null,
            'url' => $resource['url'] ?? null, 'description' => json_encode($resource, JSON_UNESCAPED_UNICODE), 'updated_at' => now(), 'created_at' => now(),
        ]);
    }

    private function upsertProjects(array $projects): void
    {
        foreach ($projects as $index => $project) DB::table('projects')->updateOrInsert(['legacy_key' => (string) $index], [
            'id' => DB::table('projects')->where('legacy_key', (string) $index)->value('id') ?? (string) Str::ulid(),
            'slug' => 'project-'.$index, 'title' => $project['title'], 'description' => $project['summary'] ?? null,
            'content' => json_encode($project, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), 'updated_at' => now(), 'created_at' => now(),
        ]);
    }

    private function assertCounts(array $data): void
    {
        $actual = ['tracks' => count($data['tracks']), 'exercises' => array_sum(array_map(fn ($track) => count($track['questions']), $data['tracks'])), 'concepts' => count($data['concepts']), 'guides' => count($data['guides'])];
        if ($actual !== $data['expected']) throw new RuntimeException('Legacy content count mismatch: '.json_encode($actual));
    }
}
