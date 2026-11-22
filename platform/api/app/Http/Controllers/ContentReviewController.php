<?php

namespace App\Http\Controllers;

use App\Models\ContentReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

final class ContentReviewController extends Controller
{
    private const RESOURCE_TABLES = [
        'lesson' => 'lessons', 'concept' => 'concepts', 'guide' => 'feature_guides',
        'project' => 'projects', 'resource' => 'resources',
    ];

    public function audit(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);
        $reviewCounts = ContentReview::query()->select('status', DB::raw('COUNT(*) AS total'))->groupBy('status')->pluck('total', 'status');
        $sourceCounts = DB::table('lessons')
            ->leftJoin('content_source_links', function ($join): void {
                $join->on('content_source_links.resource_id', '=', 'lessons.id')->where('content_source_links.resource_type', 'lesson');
            })->select('lessons.id', DB::raw('COUNT(content_source_links.content_source_id) AS source_count'))->groupBy('lessons.id');
        $lessonsWithTooFewSources = DB::query()->fromSub($sourceCounts, 'lesson_source_counts')->where('source_count', '<', 2)->count();

        return response()->json(['data' => [
            'counts' => [
                'tracks' => DB::table('tracks')->count(), 'lessons' => DB::table('lessons')->count(),
                'concepts' => DB::table('concepts')->count(), 'competencies' => DB::table('competencies')->count(),
                'guides' => DB::table('feature_guides')->count(), 'resources' => DB::table('resources')->count(),
                'projects' => DB::table('projects')->count(),
            ],
            'schemaV3Concepts' => DB::table('concepts')->where('content', 'like', '%"schemaVersion":3%')->count(),
            'issues' => [
                'placeholderPseudocode' => DB::table('concepts')->where('content', 'like', '%Decision pseudocode%')->count(),
                'genericMechanismProse' => DB::table('lessons')->where('explanation', 'like', '%authoritative state change%')->count(),
                'lessonsWithFewerThanTwoSources' => $lessonsWithTooFewSources,
                'claimsWithoutSources' => DB::table('concept_claims')->leftJoin('concept_claim_source', 'concept_claim_source.concept_claim_id', '=', 'concept_claims.id')->whereNull('concept_claim_source.concept_claim_id')->count(),
                'duplicateVisualFingerprints' => DB::table('lesson_visuals')->whereNotNull('fingerprint')->groupBy('fingerprint')->havingRaw('COUNT(*) > 1')->count(),
            ],
            'reviews' => $reviewCounts,
            'reviewPolicy' => 'Automated verification checks structure and evidence. A human editor must set editorial_reviewed after reading the technical claims and source locators.',
        ]]);
    }

    public function update(Request $request, string $type, string $id): JsonResponse
    {
        $this->authorizeAdmin($request);
        abort_unless(isset(self::RESOURCE_TABLES[$type]), 404);
        abort_unless(DB::table(self::RESOURCE_TABLES[$type])->where('id', $id)->exists(), 404);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['draft', 'automated_verified', 'editorial_reviewed', 'needs_update'])],
            'notes' => ['nullable', 'string', 'max:4000'],
        ]);
        $review = ContentReview::query()->firstOrNew(['resource_type' => $type, 'resource_id' => $id]);
        $review->fill([
            'status' => $validated['status'], 'notes' => $validated['notes'] ?? null,
            'reviewer_id' => $request->user()->id, 'content_hash' => $this->contentHash($type, $id), 'reviewed_at' => now(),
        ])->save();

        return response()->json(['data' => $review->fresh()]);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }

    private function contentHash(string $type, string $id): string
    {
        $record = DB::table(self::RESOURCE_TABLES[$type])->where('id', $id)->first();

        return hash('sha256', json_encode($record, JSON_THROW_ON_ERROR));
    }
}
