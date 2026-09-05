<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ActivityLog::class);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'module' => ['nullable', 'string', 'max:100'],
            'event' => ['nullable', 'string', 'max:100'],
            'method' => ['nullable', 'string', 'max:10'],
            'actor_id' => ['nullable', 'integer', 'min:1'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $query = ActivityLog::with('actor')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $search = "%{$search}%";

                $query->where(function ($q) use ($search) {
                    $q->where('event', 'like', $search)
                        ->orWhere('description', 'like', $search)
                        ->orWhere('actor_name', 'like', $search)
                        ->orWhere('actor_email', 'like', $search)
                        ->orWhere('url', 'like', $search)
                        ->orWhere('module', 'like', $search);
                });
            })
            ->when($filters['module'] ?? null, fn ($query, string $module) => $query->where('module', $module))
            ->when($filters['event'] ?? null, fn ($query, string $event) => $query->where('event', $event))
            ->when($filters['method'] ?? null, fn ($query, string $method) => $query->where('method', $method))
            ->when($filters['actor_id'] ?? null, fn ($query, int $actorId) => $query->where('actor_id', $actorId))
            ->when($filters['from'] ?? null, function ($query, string $from) {
                $query->whereDate('created_at', '>=', Carbon::parse($from)->startOfDay());
            })
            ->when($filters['to'] ?? null, function ($query, string $to) {
                $query->whereDate('created_at', '<=', Carbon::parse($to)->endOfDay());
            })
            ->orderByDesc('id');

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => ActivityLogResource::collection($query->paginate(20)->withQueryString()),
            'filters' => $filters,
            'modules' => ActivityLog::distinct()->orderBy('module')->pluck('module'),
            'events' => ActivityLog::distinct()->orderBy('event')->pluck('event'),
            'methods' => ActivityLog::distinct()->orderBy('method')->pluck('method'),
        ]);
    }

    public function show(Request $request, ActivityLog $activityLog)
    {
        $this->authorize('view', $activityLog);

        return Inertia::render('Admin/ActivityLogs/Show', [
            'log' => new ActivityLogResource($activityLog->load('actor')),
        ]);
    }
}
