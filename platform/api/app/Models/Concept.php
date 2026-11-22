<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Concept extends Model
{
    use UsesUlids;

    protected $guarded = [];

    public function claims(): HasMany
    {
        return $this->hasMany(ConceptClaim::class)->orderBy('position');
    }
}
