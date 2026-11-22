<?php

namespace App\Http\Controllers;

use App\Application\Learning\LearnerProgress;
use App\Models\Competency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CompetencyController extends Controller
{
    public function __construct(private readonly LearnerProgress $progress) {}

    public function index(Request $request): JsonResponse
    {
        $completed = $this->progress->completedLessonIds($request->user()->getKey());
        $competencies = Competency::query()->with('modules.lessons')->orderBy('position')->get();

        return response()->json(['data' => $competencies->map(
            fn (Competency $competency): array => $this->payload($competency, $completed, false),
        )->values()]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $competency = Competency::query()->with('modules.lessons.track')->where('slug', $slug)->firstOrFail();
        $completed = $this->progress->completedLessonIds($request->user()->getKey());

        return response()->json(['data' => $this->payload($competency, $completed, true)]);
    }

    private function payload(Competency $competency, array $completed, bool $withLessons): array
    {
        $lessonIds = $competency->modules->flatMap->lessons->pluck('id')->unique()->values();
        $completedCount = $lessonIds->filter(fn (string $id): bool => in_array($id, $completed, true))->count();
        $total = $lessonIds->count();

        return [
            'id' => $competency->id,
            'slug' => $competency->slug,
            'title' => $competency->title,
            'summary' => $competency->summary,
            'outcomes' => $competency->outcomes,
            'position' => $competency->position,
            'progress' => ['completed' => $completedCount, 'total' => $total, 'percentage' => $total ? (int) round($completedCount * 100 / $total) : 0],
            'modules' => $competency->modules->map(function ($module) use ($completed, $withLessons): array {
                $moduleCompleted = $module->lessons->filter(fn ($lesson): bool => in_array($lesson->id, $completed, true))->count();
                $data = [
                    'id' => $module->id, 'key' => $module->module_key, 'title' => $module->title,
                    'summary' => $module->summary, 'position' => $module->position,
                    'progress' => ['completed' => $moduleCompleted, 'total' => $module->lessons->count()],
                ];
                if ($withLessons) {
                    $data['lessons'] = $module->lessons->map(fn ($lesson): array => [
                        'id' => $lesson->id, 'slug' => $lesson->slug, 'legacyKey' => $lesson->legacy_key,
                        'title' => $lesson->title, 'objective' => $lesson->objective ?? '',
                        'sortOrder' => $lesson->position, 'completed' => in_array($lesson->id, $completed, true),
                        'track' => ['slug' => $lesson->track->slug, 'title' => $lesson->track->title],
                    ])->values();
                }

                return $data;
            })->values(),
        ];
    }
}
