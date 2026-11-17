<?php

namespace App\Http\Controllers;

use App\Application\ContentManagement\UpdateLesson;
use App\Http\Requests\Admin\UpdateLessonRequest;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

class AdminLessonController extends Controller
{
    public function update(UpdateLessonRequest $request, Lesson $lesson, UpdateLesson $action): JsonResponse
    {
        $lesson = $action->handle($request->user(), $lesson, $request->validated(), $request->attributes->get('request_id'));
        return response()->json(['data' => $lesson]);
    }
}
