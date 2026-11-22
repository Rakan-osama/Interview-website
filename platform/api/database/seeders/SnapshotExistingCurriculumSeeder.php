<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class SnapshotExistingCurriculumSeeder extends Seeder
{
    private const ACTION = 'curriculum.english_migration_snapshot';

    public function run(): void
    {
        if (DB::table('admin_audit_logs')->where('action', self::ACTION)->exists()) {
            return;
        }

        DB::transaction(function (): void {
            $this->snapshotTable('track', 'tracks');
            $this->snapshotTable('lesson', 'lessons', fn (object $row): array => [
                'criteria' => DB::table('rubric_criteria')->where('lesson_id', $row->id)->orderBy('position')->get()->map(fn (object $item): array => (array) $item)->all(),
            ]);
            $this->snapshotTable('concept', 'concepts');
            $this->snapshotTable('guide', 'feature_guides', fn (object $row): array => [
                'sections' => DB::table('guide_sections')->where('feature_guide_id', $row->id)->orderBy('position')->get()->map(fn (object $item): array => (array) $item)->all(),
            ]);
            $this->snapshotTable('resource', 'resources');
            $this->snapshotTable('project', 'projects');

            DB::table('admin_audit_logs')->insert([
                'id' => (string) Str::ulid(),
                'action' => self::ACTION,
                'resource_type' => 'curriculum',
                'metadata' => json_encode(['created_at' => now()->toIso8601String()], JSON_THROW_ON_ERROR),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }

    private function snapshotTable(string $type, string $table, ?callable $children = null): void
    {
        foreach (DB::table($table)->get() as $row) {
            $snapshot = (array) $row;
            if ($children) {
                $snapshot = [...$snapshot, ...$children($row)];
            }
            DB::table('content_revisions')->insert([
                'id' => (string) Str::ulid(),
                'actor_id' => null,
                'resource_type' => $type,
                'resource_id' => $row->id,
                'version' => 1,
                'snapshot' => json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
