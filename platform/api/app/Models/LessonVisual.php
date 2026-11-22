<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class LessonVisual extends Model
{
    use UsesUlids;

    protected $guarded = [];

    protected $casts = ['data' => 'array', 'schema_version' => 'integer'];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
