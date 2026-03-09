<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::query()
            ->select(['id', 'name', 'email', 'folder_id', 'drive_folder_id', 'created_at'])
            ->orderBy('name')
            ->get()
            ->map(function (Client $client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'folder_id' => $client->folder_id,
                    'drive_folder_id' => $client->resolvedDriveFolderId(),
                    'created_at' => $client->created_at,
                ];
            })
            ->values();

        return response()->json(['clients' => $clients]);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'drive_folder_id' => ['nullable', 'string', 'max:255'],
        ]);

        $driveFolderId = isset($data['drive_folder_id'])
            ? trim((string) $data['drive_folder_id'])
            : null;

        if ($driveFolderId === '') {
            $driveFolderId = null;
        }

        $client->drive_folder_id = $driveFolderId;

        // Keep legacy folder_id in sync for backward compatibility.
        if ($driveFolderId !== null) {
            $client->folder_id = $driveFolderId;
        }

        $client->save();

        return response()->json([
            'message' => 'Client Google Drive folder updated successfully.',
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'folder_id' => $client->folder_id,
                'drive_folder_id' => $client->resolvedDriveFolderId(),
            ],
        ]);
    }
}
