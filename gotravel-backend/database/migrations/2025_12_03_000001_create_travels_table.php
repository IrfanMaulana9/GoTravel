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
        Schema::create('travels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->onDelete('cascade');
            $table->string('agent_name', 100);
            $table->string('from_city', 50);
            $table->string('to_city', 50);
            $table->time('depart_time');
            $table->time('arrival_time');
            $table->string('duration', 20); // e.g., "3.5 jam"
            $table->integer('price');
            $table->integer('seats');
            $table->integer('available_seats'); // Kursi tersedia
            $table->enum('type', ['Shuttle Car', 'Private Car'])->default('Shuttle Car');
            $table->decimal('rating', 3, 1)->default(0); // Calculated from reviews
            $table->integer('reviews_count')->default(0);
            $table->text('facilities')->nullable(); // JSON string
            $table->string('image', 255)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['from_city', 'to_city']);
            $table->index(['agent_id', 'is_active']);
            $table->index('price');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travels');
    }
};