<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

final class SystemHealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = ['database' => $this->databaseCheck()];
        if (config('cache.default') === 'redis' || config('queue.default') === 'redis') {
            $checks['redis'] = $this->redisCheck();
        }
        $healthy = ! in_array('failed', $checks, true);

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'releaseDigest' => config('release.digest'),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    private function databaseCheck(): string
    {
        try {
            DB::select('SELECT 1');

            return 'ok';
        } catch (Throwable) {
            return 'failed';
        }
    }

    private function redisCheck(): string
    {
        try {
            Redis::connection()->ping();

            return 'ok';
        } catch (Throwable) {
            return 'failed';
        }
    }
}
