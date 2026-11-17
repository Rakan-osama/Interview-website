<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssessmentController extends Controller
{
    public function show(Request $request, Attempt $attempt): JsonResponse
    {
        abort_unless($attempt->user_id === $request->user()->id, 404);
        $job = DB::table('assessment_jobs')->where('attempt_id', $attempt->id)->first();
        $result = $job ? DB::table('assessment_results')->where('assessment_job_id', $job->id)->first() : null;
        return response()->json(['data' => [
            'id' => $attempt->id, 'status' => $this->status($attempt->status),
            'overallScore' => $result?->overall_score, 'criteria' => $this->json($result?->criterion_scores),
            'strengths' => $this->json($result?->strengths), 'gaps' => $this->json($result?->gaps),
            'nextSteps' => $this->json($result?->next_steps), 'confidence' => $result?->confidence ? (float) $result->confidence : null,
        ]]);
    }

    private function status(string $status): string
    {
        return match ($status) { 'queued', 'processing' => 'pending', 'completed' => 'completed', default => 'failed' };
    }

    private function json(?string $value): array
    {
        return $value ? json_decode($value, true) : [];
    }
}
