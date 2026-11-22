<?php

namespace App\Http\Controllers;

use App\Application\Assessment\AssessmentPayload;
use App\Application\Curriculum\BuildQuestionBrief;
use App\Application\Curriculum\LearningSourceRegistry;
use App\Application\Learning\LearnerProgress;
use App\Models\Attempt;
use App\Models\DraftAnswer;
use App\Models\Lesson;
use App\Models\Track;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CurriculumController extends Controller
{
    public function __construct(
        private readonly LearningSourceRegistry $sources,
        private readonly BuildQuestionBrief $questionBriefs,
        private readonly LearnerProgress $progress,
        private readonly AssessmentPayload $assessments,
    ) {}

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

    public function lesson(Request $request, Lesson $lesson): JsonResponse
    {
        return response()->json(['data' => $this->lessonPayload(
            $lesson->load(['track', 'criteria.claims', 'visuals']),
            $request->user(),
        )]);
    }

    public function lessonBySlug(Request $request, string $trackSlug, string $lessonSlug): JsonResponse
    {
        $lesson = Lesson::with(['track', 'criteria.claims', 'visuals'])
            ->whereHas('track', fn ($query) => $query->where('slug', $trackSlug))
            ->where('slug', $lessonSlug)->firstOrFail();

        return response()->json(['data' => $this->lessonPayload($lesson, $request->user())]);
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
        if (! $request->user()) {
            return [];
        }

        return $this->progress->completedLessonIds($request->user()->getKey());
    }

    private function lessonPayload(Lesson $lesson, ?User $user): array
    {
        $concepts = DB::table('concepts')
            ->join('concept_lesson', 'concepts.id', '=', 'concept_lesson.concept_id')
            ->where('concept_lesson.lesson_id', $lesson->id)
            ->select('concepts.id', 'concepts.slug', 'concepts.title', 'concepts.group_name', 'concepts.content')->get()
            ->map(function ($concept): array {
                $content = json_decode($concept->content, true);

                return [
                    'id' => $concept->id, 'slug' => $concept->slug, 'title' => $concept->title,
                    'group' => $concept->group_name, 'intro' => $content['summary'] ?? '', 'content' => $content,
                ];
            })->all();
        $learnerState = $this->learnerState($user, $lesson);
        $brief = $this->questionBriefs->forLesson($lesson);
        $rubric = $lesson->criteria->map(fn ($criterion): array => [
            'id' => $criterion->id,
            'label' => $criterion->label,
            'description' => $criterion->description,
            'terms' => $criterion->terms ?? [],
            'claimIds' => $criterion->claims->pluck('id')->all(),
            'evidenceGroups' => $criterion->evidence_groups ?? [],
            'weight' => $criterion->weight,
            'position' => $criterion->position,
        ])->values()->all();
        $visuals = $lesson->visuals->map(fn ($visual): array => [
            'id' => $visual->id,
            'kind' => $visual->kind,
            'schemaVersion' => $visual->schema_version,
            'layout' => $visual->layout,
            'title' => $visual->title,
            'caption' => $visual->caption,
            'altText' => $visual->alt_text,
            'data' => $visual->data,
        ])->values()->all();
        $sources = $this->sources->for($lesson);
        $canonicalCodeExamples = $concepts[0]['content']['codeExamples'] ?? [];

        return [
            'id' => $lesson->id, 'slug' => $lesson->slug, 'legacyKey' => $lesson->legacy_key,
            'title' => $lesson->title, 'objective' => $lesson->objective ?? '', 'sortOrder' => $lesson->position,
            'completed' => $learnerState['completed'], 'explanation' => $lesson->explanation,
            'plainExplanation' => $lesson->plain_explanation ?? '', 'interviewQuestion' => $lesson->interview_question,
            'modelAnswer' => $lesson->model_answer, 'pitfall' => $lesson->pitfall ?? '', 'code' => $lesson->code,
            'solution' => $lesson->reference_solution, 'rubric' => $rubric,
            'version' => $lesson->version, 'practicalExample' => $lesson->practical_example ?? '',
            'commonMistake' => $lesson->common_mistake ?? '', 'referenceSolution' => $lesson->reference_solution ?? '',
            'concepts' => $concepts, 'sources' => $sources,
            'questionBrief' => $brief,
            'learnerState' => $learnerState,
            'track' => ['id' => $lesson->track->id, 'slug' => $lesson->track->slug, 'title' => $lesson->track->title, 'titleAr' => $lesson->track->title_ar],
            'learningConcept' => $concepts[0] ?? null,
            'interview' => [
                'scenario' => $lesson->practical_example ?? '',
                'question' => $lesson->interview_question,
                'answerStructure' => $brief['answerStructure'],
                'modelAnswer' => $lesson->model_answer,
            ],
            'codeExamples' => $canonicalCodeExamples ?: ($lesson->code ? [[
                'language' => 'php', 'label' => 'Lesson example', 'code' => $lesson->code,
                'walkthrough' => 'Trace the input, guarantee, failure path, and expected result.',
            ]] : []),
            'visuals' => $visuals,
        ];
    }

    private function learnerState(?User $user, Lesson $lesson): array
    {
        if (! $user) {
            return ['answer' => '', 'draftVersion' => null, 'completed' => false, 'assessment' => null];
        }

        $draft = DraftAnswer::query()
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->first();
        $attempt = Attempt::query()
            ->where('user_id', $user->id)
            ->where('lesson_id', $lesson->id)
            ->latest('created_at')
            ->latest('id')
            ->first();
        $draftIsNewest = $draft && (! $attempt || $draft->updated_at->greaterThanOrEqualTo($attempt->created_at));

        return [
            'answer' => $draftIsNewest ? $draft->answer : ($attempt?->answer ?? $draft?->answer ?? ''),
            'draftVersion' => $draft?->version,
            'completed' => $this->progress->lessonIsCompleted($user->id, $lesson->id),
            'assessment' => $attempt ? $this->assessments->forAttempt($attempt) : null,
        ];
    }
}
