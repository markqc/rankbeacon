<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\Auth\LogoutController;
use App\Http\Controllers\Admin\Auth\PasskeyLoginController;
use App\Http\Controllers\Admin\Auth\PasswordChangeController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PasskeyController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\AnalyticsController as ApiAnalyticsController;
use App\Http\Controllers\Api\SerpPreviewController;
use App\Http\Controllers\HealthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/health/live', [HealthController::class, 'live'])->name('health.live');
Route::get('/health/ready', [HealthController::class, 'ready'])->name('health.ready');

Route::get('/robots.txt', function () {
    $env = config('app.env');
    $base = rtrim(config('app.url'), '/');

    if ($env === 'production') {
        $content = "User-agent: *\nAllow: /\n\nSitemap: {$base}/sitemap.xml";
    } else {
        $content = "User-agent: *\nDisallow: /";
    }

    return response($content, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
})->name('robots.txt');

Route::get('/sitemap.xml', function () {
    $base = rtrim(config('app.url'), '/');
    $pages = ['/', '/tools', '/tools/serp-preview', '/guides', '/about', '/privacy', '/terms'];
    $date = now()->toDateString();

    $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

    foreach ($pages as $path) {
        $loc = htmlspecialchars($base.$path, ENT_XML1, 'UTF-8');
        $xml .= "    <url>\n";
        $xml .= "        <loc>{$loc}</loc>\n";
        $xml .= "        <lastmod>{$date}</lastmod>\n";
        $xml .= "        <changefreq>monthly</changefreq>\n";
        $xml .= "        <priority>0.8</priority>\n";
        $xml .= "    </url>\n";
    }

    $xml .= '</urlset>';

    return response($xml, 200, ['Content-Type' => 'text/xml; charset=UTF-8']);
})->name('sitemap.xml');

Route::post('/api/v1/serp-preview/fetch', SerpPreviewController::class)
    ->middleware('throttle:serp-fetch')
    ->name('api.serp-preview.fetch');

Route::post('/api/analytics/event', [ApiAnalyticsController::class, 'store'])
    ->middleware('throttle:analytics-event')
    ->name('analytics.event');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('admin.guest')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->middleware('throttle:admin-login')->name('login.store');
        Route::post('login/passkey/options', [PasskeyLoginController::class, 'options'])->middleware('throttle:admin-login')->name('login.passkey.options');
        Route::post('login/passkey', [PasskeyLoginController::class, 'store'])->middleware('throttle:admin-login')->name('login.passkey');
    });

    Route::middleware(['auth', 'admin.active', 'can:admin.access', 'admin.log-page-view'])->group(function () {
        Route::post('logout', LogoutController::class)->name('logout');

        Route::get('password/change', [PasswordChangeController::class, 'edit'])->name('password.change.edit');
        Route::patch('password/change', [PasswordChangeController::class, 'update'])->name('password.change.update');
    });

    Route::middleware(['auth', 'admin.active', 'can:admin.access', 'admin.password-changed', 'admin.log-page-view'])->group(function () {
        Route::get('/', fn () => redirect()->route('admin.dashboard'))->name('index');
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('analytics', AnalyticsController::class)->name('analytics');
        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('profile/sessions/{sessionId}', [ProfileController::class, 'destroySession'])->name('profile.sessions.destroy');
        Route::post('profile/passkeys/options', [PasskeyController::class, 'options'])->name('profile.passkeys.options');
        Route::post('profile/passkeys', [PasskeyController::class, 'store'])->name('profile.passkeys.store');
        Route::delete('profile/passkeys/{passkey}', [PasskeyController::class, 'destroy'])->name('profile.passkeys.destroy');
        Route::resource('users', UserController::class);
        Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('settings/test-email', [SettingsController::class, 'sendTestEmail'])->name('settings.test-email');
        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::get('activity-logs/{activityLog}', [ActivityLogController::class, 'show'])->name('activity-logs.show');
    });
});

Route::redirect('/login', '/admin/login', 302)->name('login');

Route::inertia('/', 'Home')->name('home');
Route::inertia('/tools', 'Tools/Index')->name('tools.index');
Route::inertia('/tools/serp-preview', 'Tools/SerpPreview')->name('tools.serp-preview');
Route::inertia('/guides', 'Guides')->name('guides');
Route::inertia('/about', 'About')->name('about');
Route::inertia('/privacy', 'Privacy')->name('privacy');
Route::inertia('/terms', 'Terms')->name('terms');

Route::fallback(function (Request $request) {
    return Inertia::render('Error/404')->toResponse($request)->setStatusCode(404);
})->name('fallback');
