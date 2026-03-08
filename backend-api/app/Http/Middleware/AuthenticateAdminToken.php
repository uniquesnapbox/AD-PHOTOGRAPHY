<?php

namespace App\Http\Middleware;

use App\Models\AdminApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAdminToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $rawToken = $request->bearerToken();
        if (!$rawToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $hashed = hash('sha256', $rawToken);
        $record = AdminApiToken::with('admin')->where('token', $hashed)->first();

        if (!$record || !$record->admin) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($record->expires_at && $record->expires_at->isPast()) {
            $record->delete();
            return response()->json(['message' => 'Token expired'], 401);
        }

        $record->forceFill(['last_used_at' => now()])->save();
        $request->attributes->set('admin', $record->admin);
        $request->attributes->set('admin_token', $record);

        return $next($request);
    }
}