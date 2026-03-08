<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $booking->invoice_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #111827; font-size: 13px; }
        .header { margin-bottom: 22px; }
        .brand { font-size: 24px; font-weight: bold; color: #e21b1b; }
        .sub { color: #4b5563; margin-top: 4px; }
        .invoice-box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
        .grid { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .grid th, .grid td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        .grid th { background: #f9fafb; }
        .totals { margin-top: 16px; text-align: right; font-size: 15px; font-weight: bold; }
        .foot { margin-top: 26px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
<div class="header">
    <div class="brand">{{ $companyName }}</div>
    <div class="sub">Dakbunglow Road, Karimganj, Assam 788710</div>
    <div class="sub">Email: contact@adphotography.in | Phone: +91 9085748099</div>
</div>

<div class="invoice-box">
    <p><strong>Invoice Number:</strong> {{ $booking->invoice_number }}</p>
    <p><strong>Issue Date:</strong> {{ $issuedAt->format('d M Y') }}</p>
    <p><strong>Client Name:</strong> {{ $booking->name }}</p>
    <p><strong>Client Email:</strong> {{ $booking->email }}</p>

    <table class="grid">
        <thead>
        <tr>
            <th>Event Type</th>
            <th>Event Date</th>
            <th>Amount Paid (INR)</th>
            <th>Payment Reference</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>{{ $booking->event_type }}</td>
            <td>{{ optional($booking->event_date)->format('d M Y') }}</td>
            <td>{{ number_format((float) $booking->advance_amount, 2) }}</td>
            <td>{{ $booking->payment_reference }}</td>
        </tr>
        </tbody>
    </table>

    <div class="totals">Advance Paid: INR {{ number_format((float) $booking->advance_amount, 2) }}</div>
</div>

<p class="foot">This is a system generated invoice for booking payment confirmation.</p>
</body>
</html>
