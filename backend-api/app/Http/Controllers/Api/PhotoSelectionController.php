<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\PhotoSelection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhotoSelectionController extends Controller
{
    public function select(Request $request, string $photo): JsonResponse
    {
        $client = $request->attributes->get('client');
        $photoId = trim($photo);

        if ($photoId === '' || mb_strlen($photoId) > 255) {
            return response()->json(['message' => 'Invalid photo id.'], 422);
        }

        $selection = PhotoSelection::firstOrCreate(
            [
                'client_id' => $client->id,
                'photo_id' => $photoId,
            ],
            [
                'selected_at' => now(),
            ]
        );

        if (!$selection->selected_at) {
            $selection->selected_at = now();
            $selection->save();
        }

        return response()->json([
            'message' => 'Photo selected successfully.',
            'selection' => [
                'id' => $selection->id,
                'photo_id' => $selection->photo_id,
                'selected_at' => $selection->selected_at,
            ],
        ]);
    }

    public function clientIndex(Request $request): JsonResponse
    {
        $client = $request->attributes->get('client');

        $selections = PhotoSelection::query()
            ->where('client_id', $client->id)
            ->orderByDesc('selected_at')
            ->get(['id', 'photo_id', 'selected_at']);

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ],
            'selections' => $selections,
            'selected_photo_ids' => $selections->pluck('photo_id')->values(),
        ]);
    }

    public function adminIndex(Client $client): JsonResponse
    {
        $selections = PhotoSelection::query()
            ->where('client_id', $client->id)
            ->orderByDesc('selected_at')
            ->get(['id', 'photo_id', 'selected_at']);

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'drive_folder_id' => $client->resolvedDriveFolderId(),
            ],
            'total' => $selections->count(),
            'selections' => $selections,
            'selected_photo_ids' => $selections->pluck('photo_id')->values(),
        ]);
    }
}
