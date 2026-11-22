<?php

namespace App\Http\Controllers;

use App\Application\Assessment\AssessmentPayload;
use App\Models\Attempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function show(Request $request, Attempt $attempt, AssessmentPayload $payload): JsonResponse
    {
        abort_unless($attempt->user_id === $request->user()->id, 404);

        return response()->json(['data' => $payload->forAttempt($attempt)]);
    }
}
