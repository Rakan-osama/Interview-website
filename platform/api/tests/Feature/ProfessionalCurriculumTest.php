<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

final class ProfessionalCurriculumTest extends TestCase
{
    use RefreshDatabase;

    public function test_exact_professional_curriculum_counts_and_hub_membership(): void
    {
        $this->seed();
        $this->assertDatabaseCount('tracks', 63);
        $this->assertDatabaseCount('lessons', 432);
        $this->assertDatabaseCount('concepts', 184);
        $this->assertDatabaseCount('competencies', 4);
        $this->assertDatabaseCount('projects', 7);

        $expected = ['delivery-engineering' => 18, 'caching-asynchronous-work' => 27, 'secure-backend-engineering' => 32, 'relational-data-engineering' => 24];
        foreach ($expected as $slug => $total) {
            $actual = DB::table('competency_module_lesson')->join('competency_modules', 'competency_modules.id', '=', 'competency_module_lesson.competency_module_id')
                ->join('competencies', 'competencies.id', '=', 'competency_modules.competency_id')
                ->where('competencies.slug', $slug)->distinct()->count('lesson_id');
            $this->assertSame($total, $actual, "{$slug} lesson count changed");
        }
    }

    public function test_competency_progress_reuses_saved_lesson_progress(): void
    {
        $this->seed();
        $user = User::factory()->create();
        $lessonId = DB::table('lessons')->where('legacy_key', '22-6')->value('id');
        DB::table('draft_answers')->insert([
            'id' => (string) Str::ulid(), 'user_id' => $user->id, 'lesson_id' => $lessonId,
            'answer' => str_repeat('A complete saved answer. ', 4), 'version' => 1, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->actingAs($user)->getJson('/api/v1/competencies/delivery-engineering')->assertOk()
            ->assertJsonPath('data.progress.completed', 1)
            ->assertJsonPath('data.progress.total', 18);
    }

    public function test_admin_content_audit_and_editorial_review_are_protected(): void
    {
        $this->seed();
        $learner = User::factory()->create(['role' => 'learner']);
        $admin = User::factory()->create(['role' => 'admin']);
        $lessonId = DB::table('lessons')->where('legacy_key', 'se:delivery:1')->value('id');

        $this->actingAs($learner)->getJson('/api/v1/admin/content-audit')->assertForbidden();
        $this->actingAs($admin)->getJson('/api/v1/admin/content-audit')->assertOk()
            ->assertJsonPath('data.counts.lessons', 432)
            ->assertJsonPath('data.issues.placeholderPseudocode', 0);
        $this->actingAs($admin)->putJson("/api/v1/admin/content/lesson/{$lessonId}/review", [
            'status' => 'editorial_reviewed', 'notes' => 'Technical claims and source locators reviewed.',
        ])->assertOk()->assertJsonPath('data.status', 'editorial_reviewed');
    }
}
