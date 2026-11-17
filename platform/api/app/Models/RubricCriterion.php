<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;

class RubricCriterion extends Model
{
    use UsesUlids;

    protected $guarded = [];
    protected $casts = ['terms' => 'array'];
}
