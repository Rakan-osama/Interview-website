<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create {email} {--name=Administrator}';

    protected $description = 'Create or promote a protected administrator account';

    public function handle(): int
    {
        $email = mb_strtolower(trim($this->argument('email')));
        $user = User::firstOrNew(['email' => $email]);
        $user->name = $this->option('name');
        $user->role = 'admin';
        if (! $user->exists) {
            $user->password = $this->secret('Password');
        }
        $user->save();
        $this->info("Administrator ready: {$user->email}");

        return self::SUCCESS;
    }
}
