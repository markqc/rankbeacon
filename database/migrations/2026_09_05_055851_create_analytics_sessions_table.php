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
        Schema::create('analytics_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('fingerprint')->unique();
            $table->string('session_token')->unique();
            $table->string('device_type')->index();
            $table->string('user_agent')->nullable();
            $table->timestamp('first_seen_at');
            $table->timestamp('last_seen_at')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_sessions');
    }
};
