<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAdminKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $provided = $request->header('X-Admin-Key');
        $expected = env('ADMIN_API_KEY');

        if (!$expected || !$provided || !hash_equals($expected, $provided)) {
            return response()->json(['message' => 'Unauthorized admin access'], 401);
        }

        return $next($request);
    }
}
