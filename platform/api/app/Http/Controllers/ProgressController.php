<?php

namespace App\Http\Controllers;

use App\Application\Learning\LearnerProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class ProgressController extends Controller
{
    public function dashboard(Request $request, LearnerProgress $progress): JsonResponse
    {
        $userId = $request->user()->getKey();
        $attempts = DB::table('attempts')->where('user_id', $userId);

        return response()->json(['data' => [
            'completedLessons' => count($progress->completedLessonIds($userId)),
            'totalLessons' => DB::table('lessons')->count(),
            'averageScore' => round((float) ((clone $attempts)->whereNotNull('overall_score')->avg('overall_score') ?? 0), 1),
            'bookmarkedLessons' => DB::table('bookmarks')->where('user_id', $userId)->count(),
        ]]);
    }
}
