<?php

namespace App\Http\Controllers;

use App\Application\Assessment\SubmitAttempt;
use App\Http\Requests\SubmitAttemptRequest;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AttemptController extends Controller
{
    public function store(SubmitAttemptRequest $request, Lesson $lesson, SubmitAttempt $action): JsonResponse
    {
        $key = $request->header('Idempotency-Key');
        abort_if($key && ! Str::isUuid($key), 422, 'Idempotency-Key must be a UUID.');
        $attempt = $action->handle($request->user(), $lesson, $request->validated('answer'), $key);

        return response()->json(['data' => [
            'id' => $attempt->id, 'status' => 'pending', 'overallScore' => null,
            'criteria' => [], 'strengths' => [], 'gaps' => [], 'nextSteps' => [], 'confidence' => null,
        ]], 202);
    }
}
