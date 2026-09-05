<?php

namespace App\Http\Controllers\Api;

use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Http\Controllers\Controller;
use App\Http\Requests\AnalyticsEventRequest;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsTracker $tracker) {}

    public function store(AnalyticsEventRequest $request)
    {
        $eventType = $request->validated('event_type');
        $path = $request->validated('path');

        $event = match ($eventType) {
            'page_view' => $this->tracker->trackPageView($request, $path, $request->validated('metadata')),
            'tool_event' => $this->tracker->trackToolEvent(
                $request,
                $request->validated('tool'),
                $request->validated('action'),
                $request->validated('metadata'),
            ),
            default => null,
        };

        if ($event === null) {
            return response()->json(['status' => 'ignored'], 200);
        }

        return response()->json(['status' => 'recorded', 'id' => $event->id], 201);
    }
}
