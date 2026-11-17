<?php

namespace App\Application\ContentManagement;

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;

final class UpdateLesson
{
    public function handle(User $actor, Lesson $lesson, array $data, ?string $requestId): Lesson
    {
        return DB::transaction(function () use ($actor, $lesson, $data, $requestId): Lesson {
            $locked = Lesson::query()->lockForUpdate()->findOrFail($lesson->id);
            if ($locked->version !== $data['version']) {
                throw new HttpResponseException(response()->json([
                    'message' => 'The lesson changed after you loaded it.',
                    'current_version' => $locked->version,
                ], 409));
            }
            DB::table('content_revisions')->insert([
                'id' => (string) str()->ulid(), 'actor_id' => $actor->id, 'resource_type' => 'lesson',
                'resource_id' => $locked->id, 'version' => $locked->version,
                'snapshot' => json_encode($locked->load('criteria')->toArray(), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $criteria = $data['criteria'];
            unset($data['criteria'], $data['version']);
            $locked->fill($data + ['version' => $locked->version + 1])->save();
            $locked->criteria()->delete();
            foreach ($criteria as $position => $criterion) $locked->criteria()->create($criterion + ['position' => $position]);
            DB::table('admin_audit_logs')->insert([
                'id' => (string) str()->ulid(), 'actor_id' => $actor->id, 'action' => 'lesson.updated',
                'resource_type' => 'lesson', 'resource_id' => $locked->id,
                'metadata' => json_encode(['version' => $locked->version]), 'request_id' => $requestId,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            return $locked->load('criteria');
        });
    }
}
