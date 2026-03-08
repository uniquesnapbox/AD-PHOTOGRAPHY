<?php

namespace App\Http\Middleware;

use App\Models\ClientApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateClientToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $rawToken = $request->bearerToken();
        if (!$rawToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $hashed = hash('sha256', $rawToken);
        $record = ClientApiToken::with('client')
            ->where('token', $hashed)
            ->first();

        if (!$record || !$record->client) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($record->expires_at && $record->expires_at->isPast()) {
            $record->delete();
            return response()->json(['message' => 'Token expired'], 401);
        }

        $record->forceFill(['last_used_at' => now()])->save();
        $request->attributes->set('client', $record->client);
        $request->attributes->set('client_token', $record);

        return $next($request);
    }
}
