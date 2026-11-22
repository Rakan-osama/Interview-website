<?php

use App\Http\Controllers\AdminLessonController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AttemptController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CompetencyController;
use App\Http\Controllers\ContentReviewController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DraftAnswerController;
use App\Http\Controllers\LegacyProgressController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\SystemHealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', SystemHealthController::class)->middleware('throttle:60,1');
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,1');
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/tracks', [CurriculumController::class, 'tracks']);
        Route::get('/competencies', [CompetencyController::class, 'index']);
        Route::get('/competencies/{slug}', [CompetencyController::class, 'show']);
        Route::get('/tracks/{track}', [CurriculumController::class, 'track']);
        Route::get('/tracks/{trackSlug}/lessons/{lessonSlug}', [CurriculumController::class, 'lessonBySlug']);
        Route::get('/lessons/{lesson}', [CurriculumController::class, 'lesson']);
        Route::get('/legacy/resolve', [CurriculumController::class, 'legacy']);
        Route::get('/concepts', [LibraryController::class, 'concepts']);
        Route::get('/concepts/{slug}', [LibraryController::class, 'concept']);
        Route::get('/guides', [LibraryController::class, 'guides']);
        Route::get('/guides/{slug}', [LibraryController::class, 'guide']);
        Route::get('/resources', [LibraryController::class, 'resources']);
        Route::get('/projects', [LibraryController::class, 'projects']);
        Route::get('/me', fn (Request $request) => ['data' => $request->user()]);
        Route::get('/me/dashboard', [ProgressController::class, 'dashboard']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/email/verification-notification', function (Request $request) {
            if (! $request->user()->hasVerifiedEmail()) {
                $request->user()->sendEmailVerificationNotification();
            }

            return response()->json([], 202);
        })->middleware('throttle:3,1');
        Route::get('/email/verify/{id}/{hash}', function (Request $request) {
            abort_unless(hash_equals((string) $request->route('id'), (string) $request->user()->getKey()), 403);
            if (! $request->user()->hasVerifiedEmail()) {
                $request->user()->markEmailAsVerified();
            }

            return redirect('/dashboard?verified=1');
        })->middleware('signed')->name('verification.verify');
        Route::post('/lessons/{lesson}/attempts', [AttemptController::class, 'store'])->middleware('throttle:20,1');
        Route::put('/lessons/{lesson}/draft', [DraftAnswerController::class, 'update'])->middleware('throttle:120,1');
        Route::get('/attempts/{attempt}', [AssessmentController::class, 'show'])->middleware('throttle:60,1');
        Route::put('/admin/lessons/{lesson}', [AdminLessonController::class, 'update'])->middleware('throttle:60,1');
        Route::get('/admin/content-audit', [ContentReviewController::class, 'audit'])->middleware('throttle:30,1');
        Route::put('/admin/content/{type}/{id}/review', [ContentReviewController::class, 'update'])->middleware('throttle:60,1');
        Route::post('/legacy-progress/import', [LegacyProgressController::class, 'import'])->middleware('throttle:5,1');
    });
});
