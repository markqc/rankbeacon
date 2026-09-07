<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Analytics\Services\AnalyticsDashboard;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\SerpFetchResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(private readonly AnalyticsDashboard $dashboard) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $recentActivity = ActivityLog::latest()
            ->limit(10)
            ->get(['event', 'module', 'description', 'actor_name', 'created_at']);

        $page = (int) $request->input('page', 1);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $this->dashboard->stats(),
            'recentActivity' => $recentActivity,
            'recentSerpFetches' => SerpFetchResource::collection($this->dashboard->recentSerpFetches($page)),
        ]);
    }
}
