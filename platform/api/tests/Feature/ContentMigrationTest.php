<?php

namespace Tests\Feature;

use Database\Seeders\LegacyContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use App\Application\Learning\ImportLegacyProgress;
use App\Models\User;

class ContentMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_legacy_content_record_is_imported_once(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $this->assertDatabaseCount('tracks', 54);
        $this->assertDatabaseCount('lessons', 350);
        $this->assertDatabaseCount('concepts', 102);
        $this->assertDatabaseCount('feature_guides', 16);
        $this->assertSame(350, DB::table('lessons')->distinct()->count('legacy_key'));
        $this->assertSame(0, DB::table('lessons')->whereNull('legacy_key')->count());
    }

    public function test_import_is_idempotent(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $ids = DB::table('lessons')->orderBy('legacy_key')->pluck('id')->all();
        $this->seed(LegacyContentSeeder::class);
        $this->assertSame($ids, DB::table('lessons')->orderBy('legacy_key')->pluck('id')->all());
        $this->assertDatabaseCount('lessons', 350);
    }

    public function test_track_and_project_endpoints_expose_ordered_training_content(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $user = User::factory()->create();
        $track = DB::table('tracks')->where('legacy_key', '0')->first();

        $this->getJson('/api/v1/tracks')->assertUnauthorized();
        $this->actingAs($user)->getJson('/api/v1/tracks/'.$track->slug)->assertOk()
            ->assertJsonCount(22, 'data.lessons')->assertJsonPath('data.lessons.0.legacyKey', '0-0');
        $this->actingAs($user)->getJson('/api/v1/projects')->assertOk()
            ->assertJsonPath('data.0.legacy_key', '0')->assertJsonCount(5, 'data.0.content.deliverables');
    }

    public function test_every_concept_has_the_complete_learning_structure(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $required = ['intro', 'how', 'when', 'code', 'walkthrough', 'trap', 'check'];

        foreach (DB::table('concepts')->get() as $concept) {
            $content = json_decode($concept->content, true, flags: JSON_THROW_ON_ERROR);
            foreach ($required as $field) {
                $this->assertArrayHasKey($field, $content, "{$concept->slug} is missing {$field}");
                $this->assertNotEmpty($content[$field], "{$concept->slug}.{$field} must not be empty");
            }
            $this->assertIsArray($content['walkthrough']);
        }
    }

    public function test_concept_endpoint_exposes_learning_content_and_official_references(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $user = User::factory()->create();
        $concept = DB::table('concepts')->where('group_name', 'PHP')->first();

        $this->actingAs($user)->getJson('/api/v1/concepts/'.$concept->slug)->assertOk()
            ->assertJsonPath('data.group', 'PHP')
            ->assertJsonStructure(['data' => ['content' => ['intro', 'how', 'when', 'code', 'walkthrough', 'trap', 'check'], 'references' => [['title', 'url', 'note']]]]);
    }

    public function test_legacy_progress_import_is_previewable_and_idempotent(): void
    {
        $this->seed(LegacyContentSeeder::class);
        $user = User::factory()->create();
        $progress = [
            'attempts' => ['0-0' => ['answer' => 'A sufficiently detailed migrated answer.', 'date' => now()->toISOString(), 'hits' => [true, false, true, false], 'flags' => []]],
            'drafts' => ['0-1' => 'A saved draft'], 'bookmarks' => ['0-2'], 'last' => '0-2',
        ];
        $action = app(ImportLegacyProgress::class);
        $this->assertSame(3, $action->preview($progress)['mapped_lessons']);
        $this->assertFalse($action->apply($user, $progress, 'test')['already_imported']);
        $this->assertTrue($action->apply($user, $progress, 'test')['already_imported']);
        $this->assertDatabaseCount('attempts', 1);
        $this->assertDatabaseCount('draft_answers', 1);
        $this->assertDatabaseCount('bookmarks', 1);
    }
}
