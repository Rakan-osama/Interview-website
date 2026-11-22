<?php

namespace App\Application\Curriculum;

use App\Models\Lesson;
use Illuminate\Support\Facades\DB;

final class LearningSourceRegistry
{
    public function for(Lesson $lesson): array
    {
        return DB::table('content_sources')
            ->join('content_source_links', 'content_sources.id', '=', 'content_source_links.content_source_id')
            ->where('content_source_links.resource_type', 'lesson')
            ->where('content_source_links.resource_id', $lesson->id)
            ->orderByDesc('content_source_links.is_primary')
            ->orderBy('content_sources.title')
            ->get()
            ->map(fn (object $source): array => [
                'id' => $source->id,
                'title' => $source->title,
                'url' => $source->url,
                'publisher' => $source->publisher,
                'applicableVersion' => $source->applicable_version,
                'sectionLocator' => $source->section_locator,
                'reviewedAt' => $source->reviewed_at,
                'isPrimary' => (bool) $source->is_primary,
            ])->all();
    }
}
