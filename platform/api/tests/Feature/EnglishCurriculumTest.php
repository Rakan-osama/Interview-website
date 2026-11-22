<?php

namespace Tests\Feature;

use App\Rules\EnglishAuthoredContent;
use Database\Seeders\LegacyContentSeeder;
use Database\Seeders\SnapshotExistingCurriculumSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

final class EnglishCurriculumTest extends TestCase
{
    use RefreshDatabase;

    public function test_canonical_curriculum_is_english_structured_and_fully_linked(): void
    {
        $this->seed();

        $this->assertDatabaseCount('tracks', 63);
        $this->assertDatabaseCount('lessons', 432);
        $this->assertDatabaseCount('concepts', 184);
        $this->assertDatabaseCount('feature_guides', 16);
        $this->assertDatabaseCount('resources', 12);
        $this->assertDatabaseCount('projects', 7);
        $this->assertDatabaseCount('competencies', 4);
        $this->assertSame(432, DB::table('concept_lesson')->distinct()->count('lesson_id'));
        $this->assertSame(0, DB::table('rubric_criteria')->whereNull('description')->count());
        $this->assertSame(DB::table('rubric_criteria')->count(), DB::table('rubric_criterion_claim')->count());

        foreach (DB::table('lessons')->get() as $lesson) {
            $this->assertSame(0, DB::table('content_source_links')->where('resource_type', 'lesson')->where('resource_id', $lesson->id)->count() < 2 ? 1 : 0, "{$lesson->legacy_key} needs two sources");
            $this->assertNoArabic((array) $lesson, "lesson {$lesson->legacy_key}");
            $this->assertNoExactParagraphDuplication((array) $lesson, "lesson {$lesson->legacy_key}");
        }
        foreach (['tracks', 'concepts', 'feature_guides', 'guide_sections', 'resources', 'projects', 'rubric_criteria', 'content_sources', 'concept_claims', 'lesson_visuals'] as $table) {
            foreach (DB::table($table)->get() as $row) {
                $this->assertNoArabic((array) $row, "{$table} {$row->id}");
            }
        }
    }

    public function test_visuals_and_sources_use_typed_reviewable_data(): void
    {
        $this->seed();
        $this->assertGreaterThan(30, DB::table('lesson_visuals')->count());
        foreach (DB::table('lesson_visuals')->get() as $visual) {
            $this->assertContains($visual->kind, ['pipeline', 'data-flow', 'state-machine', 'architecture', 'comparison', 'entity-relationship', 'transaction-timeline']);
            $data = json_decode($visual->data, true, flags: JSON_THROW_ON_ERROR);
            $this->assertNotEmpty($data['nodes']);
            $this->assertNotEmpty($data['edges']);
            $this->assertNotEmpty($visual->caption);
            $this->assertNotEmpty($visual->alt_text);
        }
        $this->assertDatabaseHas('content_sources', ['source_key' => 'laravel-docs', 'applicable_version' => 'Laravel 12.x']);
        $this->assertDatabaseHas('content_sources', ['source_key' => 'oauth-bcp', 'applicable_version' => 'RFC 9700']);
    }

    public function test_snapshot_is_idempotent_and_preserves_every_existing_resource(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $expected = DB::table('tracks')->count() + DB::table('lessons')->count() + DB::table('concepts')->count()
            + DB::table('feature_guides')->count() + DB::table('resources')->count() + DB::table('projects')->count();
        $this->seed(SnapshotExistingCurriculumSeeder::class);
        $this->assertDatabaseCount('content_revisions', $expected);
        $this->seed(SnapshotExistingCurriculumSeeder::class);
        $this->assertDatabaseCount('content_revisions', $expected);
    }

    public function test_cms_rejects_arabic_only_for_authored_curriculum(): void
    {
        $validator = Validator::make(['content' => 'An English definition.'], ['content' => [new EnglishAuthoredContent]]);
        $this->assertFalse($validator->fails());
        $validator = Validator::make(['content' => 'Arabic authored content: مثال'], ['content' => [new EnglishAuthoredContent]]);
        $this->assertTrue($validator->fails());
    }

    private function assertNoArabic(array $record, string $context): void
    {
        foreach ($record as $field => $value) {
            if (! is_string($value)) {
                continue;
            }
            $this->assertDoesNotMatchRegularExpression('/\p{Arabic}/u', $value, "Arabic text found in {$context}.{$field}");
        }
    }

    private function assertNoExactParagraphDuplication(array $record, string $context): void
    {
        $paragraphs = [];
        foreach (['objective', 'explanation', 'practical_example', 'interview_question', 'model_answer', 'pitfall'] as $field) {
            foreach (preg_split('/\n{2,}/', (string) ($record[$field] ?? '')) ?: [] as $paragraph) {
                $normalized = preg_replace('/\W+/u', ' ', mb_strtolower(trim($paragraph))) ?? '';
                if (mb_strlen($normalized) < 80) {
                    continue;
                }
                $this->assertArrayNotHasKey($normalized, $paragraphs, "Repeated paragraph in {$context}: {$field}");
                $paragraphs[$normalized] = $field;
            }
        }
    }
}
