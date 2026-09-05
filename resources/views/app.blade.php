<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @php
        $faviconSetting = \App\Models\Setting::where('key', 'favicon_path')->first();
        $favicon = $faviconSetting?->value;
        $faviconVersion = $faviconSetting?->updated_at?->timestamp ?? time();
        $faviconUrl = $favicon ? $favicon . (str_contains($favicon, '?') ? '&' : '?') . 'v=' . $faviconVersion : null;
    @endphp
    @if ($faviconUrl)
        <link rel="icon" type="image/png" sizes="any" href="{{ $faviconUrl }}">
        <link rel="apple-touch-icon" href="{{ $faviconUrl }}">
    @else
        <link rel="icon" href="{{ asset('favicon.ico') }}?v={{ $faviconVersion }}">
    @endif
    @inertiaHead
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="font-sans antialiased bg-white text-slate-900">
    @inertia
</body>
</html>
