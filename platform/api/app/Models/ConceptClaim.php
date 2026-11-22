<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ConceptClaim extends Model
{
    use UsesUlids;

    protected $guarded = [];

    protected $casts = ['evidence_groups' => 'array'];

    public function concept(): BelongsTo
    {
        return $this->belongsTo(Concept::class);
    }
}
