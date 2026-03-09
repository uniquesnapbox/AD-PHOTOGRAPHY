<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPaymentSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = PaymentSetting::query()->first();

        return response()->json([
            'payment_settings' => [
                'id' => $setting?->id,
                'upi_id' => $setting?->upi_id,
                'upi_name' => $setting?->upi_name,
                'bank_name' => $setting?->bank_name,
                'account_name' => $setting?->account_name,
                'account_number' => $setting?->account_number,
                'ifsc_code' => $setting?->ifsc_code,
                'created_at' => $setting?->created_at,
                'updated_at' => $setting?->updated_at,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'upi_id' => ['nullable', 'string', 'max:255'],
            'upi_name' => ['nullable', 'string', 'max:255'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:255'],
            'ifsc_code' => ['nullable', 'string', 'max:255'],
        ]);

        $setting = PaymentSetting::query()->first() ?? new PaymentSetting();
        $setting->fill([
            'upi_id' => $this->normalize($data['upi_id'] ?? null),
            'upi_name' => $this->normalize($data['upi_name'] ?? null),
            'bank_name' => $this->normalize($data['bank_name'] ?? null),
            'account_name' => $this->normalize($data['account_name'] ?? null),
            'account_number' => $this->normalize($data['account_number'] ?? null),
            'ifsc_code' => $this->normalize($data['ifsc_code'] ?? null),
        ]);
        $setting->save();

        return response()->json([
            'message' => 'Payment settings updated successfully.',
            'payment_settings' => [
                'id' => $setting->id,
                'upi_id' => $setting->upi_id,
                'upi_name' => $setting->upi_name,
                'bank_name' => $setting->bank_name,
                'account_name' => $setting->account_name,
                'account_number' => $setting->account_number,
                'ifsc_code' => $setting->ifsc_code,
                'created_at' => $setting->created_at,
                'updated_at' => $setting->updated_at,
            ],
        ]);
    }

    private function normalize(?string $value): ?string
    {
        if ($value === null) return null;
        $trimmed = trim($value);
        return $trimmed === '' ? null : $trimmed;
    }
}
