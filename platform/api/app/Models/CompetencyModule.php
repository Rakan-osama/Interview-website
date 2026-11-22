<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CompetencyModule extends Model
{
    use UsesUlids;

    protected $guarded = [];

    public function competency(): BelongsTo
    {
        return $this->belongsTo(Competency::class);
    }

    public function lessons(): BelongsToMany
    {
        return $this->belongsToMany(Lesson::class, 'competency_module_lesson')
            ->withPivot(['is_required', 'position'])
            ->orderByPivot('position');
    }
}
