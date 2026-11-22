<?php

namespace App\Models;

use App\Models\Concerns\UsesUlids;
use Illuminate\Database\Eloquent\Model;

final class ContentSource extends Model
{
    use UsesUlids;

    protected $guarded = [];

    protected $casts = ['reviewed_at' => 'date'];
}
