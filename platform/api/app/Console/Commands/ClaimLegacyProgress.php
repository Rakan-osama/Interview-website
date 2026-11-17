<?php

namespace App\Console\Commands;

use App\Application\Learning\ImportLegacyProgress;
use App\Models\User;
use Illuminate\Console\Command;
use PDO;

class ClaimLegacyProgress extends Command
{
    protected $signature = 'legacy:claim-progress {email} {--profile=default} {--apply}';
    protected $description = 'Preview or claim one legacy XAMPP progress profile';

    public function handle(ImportLegacyProgress $action): int
    {
        $user = User::where('email', $this->argument('email'))->firstOrFail();
        $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=interview_website;charset=utf8mb4', env('LEGACY_DB_USERNAME', 'root'), env('LEGACY_DB_PASSWORD', ''), [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $statement = $pdo->prepare('SELECT progress_json FROM user_progress WHERE profile_id = ?');
        $statement->execute([$this->option('profile')]);
        $json = $statement->fetchColumn();
        if (! $json) { $this->error('Legacy profile not found.'); return self::FAILURE; }
        $progress = json_decode($json, true, flags: JSON_THROW_ON_ERROR);
        $totals = $this->option('apply') ? $action->apply($user, $progress, 'mysql:'.$this->option('profile')) : $action->preview($progress);
        $this->table(['Metric', 'Count'], collect($totals)->map(fn ($value, $key) => [$key, is_bool($value) ? ($value ? 'yes' : 'no') : $value]));
        if (! $this->option('apply')) $this->info('Preview only. Re-run with --apply after reviewing totals.');
        return self::SUCCESS;
    }
}
