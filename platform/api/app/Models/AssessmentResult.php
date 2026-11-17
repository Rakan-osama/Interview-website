<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;

class AssessmentResult extends Model
{
    use UsesUlids;

    protected $guarded = [];
    protected $casts = [
        'criterion_scores' => 'array',
        'strengths' => 'array',
        'gaps' => 'array',
        'next_steps' => 'array',
        'raw_metadata' => 'array',
        'confidence' => 'float',
    ];
}
