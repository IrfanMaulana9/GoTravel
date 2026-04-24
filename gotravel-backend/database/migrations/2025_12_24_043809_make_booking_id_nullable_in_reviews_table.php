<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop the foreign key first
            $table->dropForeign(['booking_id']);
            
            // Drop the unique constraint
            $table->dropUnique(['booking_id']);
        });
        
        Schema::table('reviews', function (Blueprint $table) {
            // Make booking_id nullable and add foreign key back
            $table->foreignId('booking_id')->nullable()->change();
        });
        
        Schema::table('reviews', function (Blueprint $table) {
            // Add foreign key constraint back
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Revert back to non-nullable
            $table->dropForeign(['booking_id']);
            $table->foreignId('booking_id')->nullable(false)->change()->constrained()->onDelete('cascade');
            $table->unique('booking_id');
        });
    }
};
