<?php

namespace App\Http\Middleware;

use App\Domain\Admin\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'app' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
                'env' => config('app.env'),
            ],
            'branding' => fn () => $this->brandingProps(),
            'auth' => [
                'user' => $this->resolveUser($request),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }

    private function brandingProps(): array
    {
        $settings = app(SettingsService::class);

        return [
            'site_name' => $settings->get('site_name') ?: config('app.name'),
            'tagline' => $settings->get('site_tagline') ?: 'SEO Tools by Authority Lighthouse',
            'logo_path' => $settings->get('logo_path'),
            'favicon_path' => $settings->get('favicon_path'),
            'primary_color' => $settings->get('primary_color') ?: '#0f172a',
        ];
    }

    private function resolveUser(Request $request): ?array
    {
        $user = $request->user();

        if ($user === null) {
            return null;
        }

        $user->loadMissing('roles');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'avatar_path' => $user->avatar_path,
            'roles' => $user->roles->pluck('name')->all(),
        ];
    }
}
