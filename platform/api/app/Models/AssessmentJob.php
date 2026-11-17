<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;

class AssessmentJob extends Model
{
    use UsesUlids;

    protected $guarded = [];
    protected $casts = ['completed_at' => 'datetime'];
}
