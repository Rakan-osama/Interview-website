<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RubricCriterion extends Model
{
    use UsesUlids;

    protected $guarded = [];

    protected $casts = ['terms' => 'array', 'evidence_groups' => 'array'];

    public function claims(): BelongsToMany
    {
        return $this->belongsToMany(ConceptClaim::class, 'rubric_criterion_claim');
    }
}
