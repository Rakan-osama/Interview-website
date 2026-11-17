<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LibraryController extends Controller
{
    public function concepts(): JsonResponse
    {
        return response()->json(['data' => DB::table('concepts')->select('id', 'slug', 'title', 'group_name as group')->orderBy('group_name')->orderBy('title')->get()]);
    }

    public function concept(string $slug): JsonResponse
    {
        $concept = DB::table('concepts')->where('slug', $slug)->first();
        abort_unless($concept, 404);
        return response()->json(['data' => [
            ...(array) $concept,
            'group' => $concept->group_name,
            'content' => json_decode($concept->content, true),
            'references' => config('concept-references.'.$concept->group_name, []),
        ]]);
    }

    public function guides(): JsonResponse
    {
        return response()->json(['data' => DB::table('feature_guides')->select('id', 'slug', 'title', 'domain', 'summary', 'simulator_key as simulatorKey')->orderBy('title')->get()]);
    }

    public function guide(string $slug): JsonResponse
    {
        $guide = DB::table('feature_guides')->where('slug', $slug)->first();
        abort_unless($guide, 404);
        $sections = DB::table('guide_sections')->where('feature_guide_id', $guide->id)->orderBy('position')->get()->map(fn ($section) => [...(array) $section, 'content' => json_decode($section->content, true)]);
        return response()->json(['data' => [...(array) $guide, 'sections' => $sections]]);
    }

    public function resources(): JsonResponse
    {
        return response()->json(['data' => DB::table('resources')->select('id', 'slug', 'title', 'type', 'url', 'description')->orderBy('title')->get()]);
    }

    public function projects(): JsonResponse
    {
        $projects = DB::table('projects')->get()->sortBy(fn ($project) => (int) $project->legacy_key)->values()
            ->map(fn ($project) => [...(array) $project, 'content' => json_decode($project->content, true)]);
        return response()->json(['data' => $projects]);
    }
}
