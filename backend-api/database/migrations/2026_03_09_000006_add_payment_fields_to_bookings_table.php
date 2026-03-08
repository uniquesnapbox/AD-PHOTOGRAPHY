<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'paid'])->default('pending')->after('status');
            $table->decimal('advance_amount', 10, 2)->default(0)->after('advance_payment');
            $table->string('payment_reference')->nullable()->after('advance_amount');
            $table->string('invoice_number')->nullable()->unique()->after('payment_reference');
        });

        DB::table('bookings')->update([
            'advance_amount' => DB::raw('advance_payment'),
        ]);
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique('bookings_invoice_number_unique');
            $table->dropColumn([
                'payment_status',
                'advance_amount',
                'payment_reference',
                'invoice_number',
            ]);
        });
    }
};
