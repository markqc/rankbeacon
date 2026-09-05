<?php

namespace App\Http\Middleware\Admin;

use App\Domain\Admin\Services\ActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAdminPageView
{
    public function __construct(private readonly ActivityLogger $logger) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldLog($request, $response)) {
            $this->logger->logAdminPageView($request->user(), $request->path());
        }

        return $response;
    }

    private function shouldLog(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET')) {
            return false;
        }

        if ($request->header('X-Inertia') === 'true') {
            return false;
        }

        if ($response->getStatusCode() >= 400) {
            return false;
        }

        if (! $request->user()) {
            return false;
        }

        return str_starts_with($request->path(), 'admin/');
    }
}
