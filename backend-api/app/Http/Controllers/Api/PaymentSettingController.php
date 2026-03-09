<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\JsonResponse;

class PaymentSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = PaymentSetting::query()->first();

        return response()->json([
            'payment_settings' => [
                'upi_id' => $setting?->upi_id,
                'upi_name' => $setting?->upi_name,
                'bank_name' => $setting?->bank_name,
                'account_name' => $setting?->account_name,
                'account_number' => $setting?->account_number,
                'ifsc_code' => $setting?->ifsc_code,
            ],
        ]);
    }
}
