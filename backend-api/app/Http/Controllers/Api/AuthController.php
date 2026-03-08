<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientApiToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $client = Client::where('email', strtolower($data['email']))->first();
        if (!$client || !Hash::check($data['password'], $client->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $plainToken = Str::random(64);
        ClientApiToken::create([
            'client_id' => $client->id,
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(30),
            'last_used_at' => now(),
        ]);

        return response()->json([
            'token' => $plainToken,
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'drive_folder_id' => $client->resolvedDriveFolderId(),
                'folder_id' => $client->folder_id,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $client = $request->attributes->get('client');

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'drive_folder_id' => $client->resolvedDriveFolderId(),
                'folder_id' => $client->folder_id,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->attributes->get('client_token');
        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }
}
