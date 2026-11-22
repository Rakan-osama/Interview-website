<?php

namespace App\Http\Controllers;

use App\Application\Learning\LearnerProgress;
use App\Application\Learning\SaveDraftAnswer;
use App\Http\Requests\SaveDraftAnswerRequest;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

final class DraftAnswerController extends Controller
{
    public function update(
        SaveDraftAnswerRequest $request,
        Lesson $lesson,
        SaveDraftAnswer $action,
        LearnerProgress $progress,
    ): JsonResponse {
        $draft = $action->handle(
            $request->user(),
            $lesson,
            $request->validated('answer'),
            $request->validated('version'),
        );

        return response()->json(['data' => [
            'answer' => $draft?->answer ?? '',
            'version' => $draft?->version,
            'completed' => $progress->lessonIsCompleted($request->user()->id, $lesson->id),
        ]]);
    }
}
