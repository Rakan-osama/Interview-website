<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    public function update(User $user, Lesson $lesson): bool
    {
        return $user->role === 'admin';
    }
}
