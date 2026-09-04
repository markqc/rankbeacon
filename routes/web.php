<?php

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
