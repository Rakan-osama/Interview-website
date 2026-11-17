<?php

namespace App\Http\Controllers;

use App\Application\Learning\ImportLegacyProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegacyProgressController extends Controller
{
    public function import(Request $request, ImportLegacyProgress $action): JsonResponse
    {
        $data = $request->validate([
            'progress' => ['required', 'array'], 'progress.attempts' => ['required', 'array'],
            'progress.drafts' => ['required', 'array'], 'progress.bookmarks' => ['required', 'array'],
            'apply' => ['sometimes', 'boolean'],
        ]);
        $totals = ($data['apply'] ?? false)
            ? $action->apply($request->user(), $data['progress'], 'browser:backend-lab-v1')
            : $action->preview($data['progress']);
        return response()->json(['data' => $totals]);
    }
}
