<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Track;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurriculumController extends Controller
{
    public function tracks(Request $request): JsonResponse
    {
        $tracks = Track::query()->with('lessons:id,track_id,slug,legacy_key,title,objective,position')->orderBy('position')->get();
        $completed = $this->completedLessonIds($request);
        return response()->json(['data' => $tracks->map(fn (Track $track) => $this->trackPayload($track, $completed))]);
    }

    public function track(Request $request, string $trackSlug): JsonResponse
    {
        $track = Track::with('lessons')->where('slug', $trackSlug)->firstOrFail();
        return response()->json(['data' => $this->trackPayload($track, $this->completedLessonIds($request))]);
    }

    public function lesson(Lesson $lesson): JsonResponse
    {
        return response()->json(['data' => $this->lessonPayload($lesson->load(['track', 'criteria']))]);
    }

    public function lessonBySlug(string $trackSlug, string $lessonSlug): JsonResponse
    {
        $lesson = Lesson::with(['track', 'criteria'])
            ->whereHas('track', fn ($query) => $query->where('slug', $trackSlug))
            ->where('slug', $lessonSlug)->firstOrFail();
        return response()->json(['data' => $this->lessonPayload($lesson)]);
    }

    public function legacy(Request $request): JsonResponse
    {
        if ($legacyKey = $request->query('question')) {
            $lesson = Lesson::with('track')->where('legacy_key', $legacyKey)->firstOrFail();
            return response()->json(['data' => ['path' => "/tracks/{$lesson->track->slug}/lessons/{$lesson->slug}"]]);
        }
        $view = $request->query('view', 'dashboard');
        $paths = ['paths' => '/tracks', 'training' => '/tracks', 'dashboard' => '/dashboard', 'design' => '/guides'];
        return response()->json(['data' => ['path' => $paths[$view] ?? '/dashboard']]);
    }

    private function trackPayload(Track $track, array $completed = []): array
    {
        return [
            'id' => $track->id, 'slug' => $track->slug, 'title' => $track->title,
            'titleAr' => $track->title_ar, 'description' => $track->description,
            'category' => 'Interview Curriculum',
            'lessons' => $track->lessons->map(fn (Lesson $lesson) => [
                'id' => $lesson->id, 'slug' => $lesson->slug, 'legacyKey' => $lesson->legacy_key,
                'title' => $lesson->title, 'objective' => $lesson->objective ?? '',
                'sortOrder' => $lesson->position, 'completed' => in_array($lesson->id, $completed, true),
            ]),
        ];
    }

    private function completedLessonIds(Request $request): array
    {
        if (! $request->user()) return [];
        return \Illuminate\Support\Facades\DB::table('attempts')->where('user_id', $request->user()->getKey())
            ->whereIn('status', ['completed', 'migrated'])->distinct()->pluck('lesson_id')->all();
    }

    private function lessonPayload(Lesson $lesson): array
    {
        return [
            'id' => $lesson->id, 'slug' => $lesson->slug, 'legacyKey' => $lesson->legacy_key,
            'title' => $lesson->title, 'objective' => $lesson->objective ?? '', 'sortOrder' => $lesson->position,
            'completed' => false, 'explanation' => $lesson->explanation,
            'plainExplanation' => $lesson->plain_explanation ?? '', 'interviewQuestion' => $lesson->interview_question,
            'modelAnswer' => $lesson->model_answer, 'pitfall' => $lesson->pitfall ?? '', 'code' => $lesson->code,
            'solution' => $lesson->reference_solution, 'rubric' => $lesson->criteria,
            'version' => $lesson->version, 'practicalExample' => $lesson->practical_example ?? '',
            'commonMistake' => $lesson->common_mistake ?? '', 'referenceSolution' => $lesson->reference_solution ?? '',
            'track' => ['id' => $lesson->track->id, 'slug' => $lesson->track->slug, 'title' => $lesson->track->title, 'titleAr' => $lesson->track->title_ar],
        ];
    }
}
