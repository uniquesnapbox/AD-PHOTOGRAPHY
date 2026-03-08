<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'name',
        'phone',
        'email',
        'event_type',
        'event_date',
        'location',
        'message',
        'status',
        'advance_payment',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'advance_payment' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
