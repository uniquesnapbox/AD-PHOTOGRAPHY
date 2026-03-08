<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Client;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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
            'advance_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $client = Client::where('email', strtolower($data['email']))->first();
        $advanceAmount = (float) ($data['advance_amount'] ?? 0);

        $booking = Booking::create([
            ...$data,
            'client_id' => $client?->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'advance_amount' => $advanceAmount,
            'advance_payment' => $advanceAmount,
        ]);

        $adminEmail = env('ADMIN_BOOKING_EMAIL', env('MAIL_FROM_ADDRESS'));
        if ($adminEmail) {
            Mail::raw(
                "New booking received:\nName: {$booking->name}\nEvent: {$booking->event_type}\nDate: {$booking->event_date?->format('Y-m-d')}\nPhone: {$booking->phone}\nLocation: {$booking->location}",
                fn ($message) => $message->to($adminEmail)->subject('New Booking - AD Photography')
            );
        }

        Mail::raw(
            "Hi {$booking->name}, your booking request for {$booking->event_type} on {$booking->event_date?->format('Y-m-d')} has been received. Status: pending.",
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

        $bookings = Booking::where(function ($query) use ($client) {
            $query->where('email', $client->email)
                ->orWhere('client_id', $client->id);
        })
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['bookings' => $bookings]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
            'advance_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $oldStatus = $booking->status;
        $booking->status = $data['status'];

        if (array_key_exists('advance_amount', $data)) {
            $booking->advance_amount = $data['advance_amount'];
            $booking->advance_payment = $data['advance_amount'];
        }

        $booking->save();

        if ($booking->status === 'approved') {
            $paymentLink = $this->getFrontendUrl() . '/payment/' . $booking->id;
            $amount = number_format((float) $booking->advance_amount, 2, '.', '');

            Mail::raw(
                "Hi {$booking->name}, your booking is approved. Advance amount: INR {$amount}. Complete payment here: {$paymentLink}",
                fn ($message) => $message->to($booking->email)->subject('Booking Approved - Payment Link')
            );
        } elseif ($oldStatus !== $booking->status) {
            Mail::raw(
                "Hi {$booking->name}, your booking status is now '{$booking->status}'.",
                fn ($message) => $message->to($booking->email)->subject('Booking Status Update - AD Photography')
            );
        }

        return response()->json([
            'message' => 'Booking status updated.',
            'booking' => $booking,
        ]);
    }

    public function pay(Request $request, Booking $booking): JsonResponse
    {
        $client = $request->attributes->get('client');
        if (!$this->canClientAccessBooking($client, $booking)) {
            return response()->json(['message' => 'Unauthorized booking access.'], 403);
        }

        if ($booking->status !== 'approved') {
            return response()->json(['message' => 'Booking is not approved yet.'], 422);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json([
                'message' => 'Booking is already paid.',
                'booking' => $booking,
                'invoice_download_url' => url("/api/client/bookings/{$booking->id}/invoice"),
            ], 200);
        }

        $data = $request->validate([
            'payment_reference' => ['required', 'string', 'max:255'],
            'advance_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $amount = array_key_exists('advance_amount', $data)
            ? (float) $data['advance_amount']
            : (float) ($booking->advance_amount ?? 0);

        if ($amount <= 0) {
            return response()->json(['message' => 'Advance amount is not set by admin.'], 422);
        }

        $booking->payment_status = 'paid';
        $booking->payment_reference = trim($data['payment_reference']);
        $booking->advance_amount = $amount;
        $booking->advance_payment = $amount;
        $booking->invoice_number = $booking->invoice_number ?: $this->generateInvoiceNumber();
        $booking->save();

        $invoicePdf = $this->renderInvoicePdf($booking);
        $invoiceFilename = "{$booking->invoice_number}.pdf";

        Mail::raw(
            "Hi {$booking->name}, your advance payment has been received. Invoice number: {$booking->invoice_number}.",
            function ($message) use ($booking, $invoicePdf, $invoiceFilename) {
                $message->to($booking->email)
                    ->subject('Payment Received & Invoice - AD Photography')
                    ->attachData($invoicePdf, $invoiceFilename, ['mime' => 'application/pdf']);
            }
        );

        return response()->json([
            'message' => 'Payment marked as paid and invoice generated.',
            'booking' => $booking,
            'invoice_download_url' => url("/api/client/bookings/{$booking->id}/invoice"),
        ]);
    }

    public function downloadInvoice(Request $request, Booking $booking): Response|JsonResponse
    {
        $client = $request->attributes->get('client');
        if (!$this->canClientAccessBooking($client, $booking)) {
            return response()->json(['message' => 'Unauthorized booking access.'], 403);
        }

        if ($booking->payment_status !== 'paid' || !$booking->invoice_number) {
            return response()->json(['message' => 'Invoice not available until payment is completed.'], 422);
        }

        $invoicePdf = $this->renderInvoicePdf($booking);
        $fileName = "{$booking->invoice_number}.pdf";

        return response($invoicePdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }

    private function generateInvoiceNumber(): string
    {
        $prefix = 'ADP-INV-' . now()->format('Ymd') . '-';

        $lastInvoice = Booking::where('invoice_number', 'like', $prefix . '%')
            ->orderByDesc('invoice_number')
            ->value('invoice_number');

        $nextNumber = 1;
        if ($lastInvoice) {
            $sequence = (int) substr($lastInvoice, -4);
            $nextNumber = $sequence + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function renderInvoicePdf(Booking $booking): string
    {
        return Pdf::loadView('invoices.booking', [
            'booking' => $booking,
            'issuedAt' => now(),
            'companyName' => 'AD Photography',
        ])->output();
    }

    private function canClientAccessBooking($client, Booking $booking): bool
    {
        if (!$client) {
            return false;
        }

        if ($booking->client_id && (int) $booking->client_id === (int) $client->id) {
            return true;
        }

        return strtolower($booking->email) === strtolower($client->email);
    }

    private function getFrontendUrl(): string
    {
        return rtrim(env('FRONTEND_APP_URL', 'http://localhost:5173'), '/');
    }
}
