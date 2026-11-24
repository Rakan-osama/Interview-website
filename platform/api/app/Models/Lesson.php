<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use UsesUlids;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'learning_content' => 'array',
            'retired_at' => 'datetime',
        ];
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(Track::class);
    }

    public function criteria(): HasMany
    {
        return $this->hasMany(RubricCriterion::class)->orderBy('position');
    }

    public function visuals(): HasMany
    {
        return $this->hasMany(LessonVisual::class)->orderBy('position');
    }

    public function successor(): BelongsTo
    {
        return $this->belongsTo(self::class, 'superseded_by_lesson_id');
    }
}
