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
}
