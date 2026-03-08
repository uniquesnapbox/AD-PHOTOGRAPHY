<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('drive_folder_id')->nullable()->after('folder_id');
        });

        DB::table('clients')
            ->whereNull('drive_folder_id')
            ->update(['drive_folder_id' => DB::raw('folder_id')]);
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('drive_folder_id');
        });
    }
};
