<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'upi_id',
        'upi_name',
        'bank_name',
        'account_name',
        'account_number',
        'ifsc_code',
    ];
}
