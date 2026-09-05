<?php

use App\Http\Middleware\Admin\ActiveAccount;
use App\Http\Middleware\Admin\EnsurePasswordChanged;
use App\Http\Middleware\Admin\LogAdminPageView;
use App\Http\Middleware\Admin\RedirectIfAuthenticatedAdmin;
use App\Http\Middleware\ApplyMailSettings;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeadersMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            ApplyMailSettings::class,
            HandleInertiaRequests::class,
            SecurityHeadersMiddleware::class,
        ]);

        $middleware->alias([
            'admin.guest' => RedirectIfAuthenticatedAdmin::class,
            'admin.active' => ActiveAccount::class,
            'admin.password-changed' => EnsurePasswordChanged::class,
            'admin.log-page-view' => LogAdminPageView::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->respond(function ($response, Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $response;
            }

            if ($response->getStatusCode() >= 500) {
                return Inertia::render('Error/500', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();
