<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Competency extends Model
{
    use UsesUlids;

    protected $guarded = [];

    protected $casts = ['outcomes' => 'array'];

    public function modules(): HasMany
    {
        return $this->hasMany(CompetencyModule::class)->orderBy('position');
    }
}
