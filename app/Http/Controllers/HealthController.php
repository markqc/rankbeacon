<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController
{
    public function live(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => config('app.name'),
            'time' => now()->toIso8601String(),
        ]);
    }

    public function ready(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            $db = 'ok';
        } catch (\Throwable $e) {
            report($e);
            $db = 'unavailable';
        }

        return response()->json([
            'status' => $db === 'ok' ? 'ok' : 'degraded',
            'checks' => [
                'database' => $db,
            ],
        ], $db === 'ok' ? 200 : 503);
    }
}
