<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Domain\Admin\Services\ActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function __construct(private readonly ActivityLogger $logger) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $user = $request->user();

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($user !== null) {
            $this->logger->logLogout($user);
        }

        return redirect()->route('admin.login');
    }
}
