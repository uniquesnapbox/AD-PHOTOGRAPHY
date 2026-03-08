<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ClientGalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $client = $request->attributes->get('client');
        $folderId = $client->resolvedDriveFolderId();
        $apiKey = env('GOOGLE_DRIVE_API_KEY');

        if (!$folderId || !$apiKey) {
            return response()->json([
                'message' => 'Google Drive is not configured for this client.',
            ], 422);
        }

        $query = sprintf("'%s' in parents and mimeType contains 'image/' and trashed = false", $folderId);

        $response = Http::timeout(20)
            ->retry(2, 200)
            ->get('https://www.googleapis.com/drive/v3/files', [
                'q' => $query,
                'fields' => 'files(id,name,mimeType,createdTime,webViewLink)',
                'orderBy' => 'createdTime desc',
                'pageSize' => 200,
                'includeItemsFromAllDrives' => 'true',
                'supportsAllDrives' => 'true',
                'key' => $apiKey,
            ]);

        if (!$response->ok()) {
            return response()->json([
                'message' => 'Failed to fetch images from Google Drive.',
                'google_error' => $response->json(),
            ], 502);
        }

        $files = collect($response->json('files', []))
            ->map(function (array $file) {
                $id = $file['id'];
                $encodedId = rawurlencode($id);

                return [
                    'id' => $id,
                    'name' => $file['name'],
                    'created_time' => $file['createdTime'] ?? null,
                    'image' => "https://drive.google.com/thumbnail?id={$encodedId}&sz=w1600",
                    'download_url' => "https://drive.google.com/uc?export=download&id={$encodedId}",
                    'view_url' => $file['webViewLink'] ?? null,
                ];
            })
            ->values();

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'drive_folder_id' => $folderId,
            ],
            'photos' => $files,
        ]);
    }
}
