<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'event_type' => ['required', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'location' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
            'advance_payment' => ['nullable', 'numeric', 'min:0'],
        ]);

        $client = Client::where('email', strtolower($data['email']))->first();

        $booking = Booking::create([
            ...$data,
            'client_id' => $client?->id,
            'status' => 'pending',
            'advance_payment' => $data['advance_payment'] ?? 0,
        ]);

        $adminEmail = env('ADMIN_BOOKING_EMAIL', env('MAIL_FROM_ADDRESS'));
        if ($adminEmail) {
            Mail::raw(
                "New booking received:\nName: {$booking->name}\nEvent: {$booking->event_type}\nDate: {$booking->event_date}\nPhone: {$booking->phone}\nLocation: {$booking->location}",
                fn ($message) => $message->to($adminEmail)->subject('New Booking - AD Photography')
            );
        }

        Mail::raw(
            "Hi {$booking->name}, your booking request for {$booking->event_type} on {$booking->event_date} has been received. Status: pending.",
            fn ($message) => $message->to($booking->email)->subject('Booking Confirmation - AD Photography')
        );

        return response()->json([
            'message' => 'Booking submitted successfully.',
            'booking' => $booking,
        ], 201);
    }

    public function adminIndex(): JsonResponse
    {
        $bookings = Booking::orderByDesc('created_at')->get();
        return response()->json(['bookings' => $bookings]);
    }

    public function clientIndex(Request $request): JsonResponse
    {
        $client = $request->attributes->get('client');
        $bookings = Booking::where('email', $client->email)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['bookings' => $bookings]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
            'advance_payment' => ['nullable', 'numeric', 'min:0'],
        ]);

        $booking->status = $data['status'];
        if (array_key_exists('advance_payment', $data)) {
            $booking->advance_payment = $data['advance_payment'];
        }
        $booking->save();

        Mail::raw(
            "Hi {$booking->name}, your booking status is now '{$booking->status}'.",
            fn ($message) => $message->to($booking->email)->subject('Booking Status Update - AD Photography')
        );

        return response()->json([
            'message' => 'Booking status updated.',
            'booking' => $booking,
        ]);
    }
}
