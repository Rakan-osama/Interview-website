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
        $sources = DB::table('content_sources')
            ->join('content_source_links', 'content_sources.id', '=', 'content_source_links.content_source_id')
            ->where('content_source_links.resource_type', 'concept')
            ->where('content_source_links.resource_id', $concept->id)
            ->orderByDesc('content_source_links.is_primary')
            ->select('content_sources.*', 'content_source_links.is_primary')
            ->get()
            ->map(fn (object $source): array => [
                'title' => $source->title, 'publisher' => $source->publisher, 'url' => $source->url,
                'applicableVersion' => $source->applicable_version, 'sectionLocator' => $source->section_locator,
                'reviewedAt' => $source->reviewed_at, 'isPrimary' => (bool) $source->is_primary,
            ]);

        return response()->json(['data' => [
            ...(array) $concept,
            'group' => $concept->group_name,
            'content' => json_decode($concept->content, true),
            'references' => $sources,
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
        $resources = DB::table('resources')->select('id', 'slug', 'title', 'type', 'url', 'description')->orderBy('title')->get()
            ->map(fn (object $resource): array => [
                ...(array) $resource,
                'description' => json_decode($resource->description, true)['summary'] ?? $resource->description,
            ]);

        return response()->json(['data' => $resources]);
    }

    public function projects(): JsonResponse
    {
        $projects = DB::table('projects')->get()->sortBy(fn ($project) => (int) $project->legacy_key)->values()
            ->map(fn ($project) => [...(array) $project, 'content' => json_decode($project->content, true)]);

        return response()->json(['data' => $projects]);
    }
}
