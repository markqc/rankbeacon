<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Analytics\Services\AnalyticsDashboard;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\SerpFetchResource;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsDashboard $dashboard) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $startInput = $request->input('start');
        $endInput = $request->input('end');

        $start = $startInput ? Carbon::parse($startInput)->startOfDay() : now()->subDays(29)->startOfDay();
        $end = $endInput ? Carbon::parse($endInput)->endOfDay() : now()->endOfDay();

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end, $start];
        }

        $page = (int) $request->input('page', 1);

        return Inertia::render('Admin/Analytics', [
            'stats' => $this->dashboard->rangeStats($start, $end),
            'startDate' => $start->toDateString(),
            'endDate' => $end->toDateString(),
            'recentSerpFetches' => SerpFetchResource::collection($this->dashboard->recentSerpFetches($page, 10, $start, $end)),
        ]);
    }
}
