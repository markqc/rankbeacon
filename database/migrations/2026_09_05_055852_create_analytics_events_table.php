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
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analytics_session_id')->constrained('analytics_sessions')->cascadeOnDelete();
            $table->string('event_type')->index();
            $table->string('page_path', 500)->nullable();
            $table->string('tool_name')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->index();

            $table->index(['event_type', 'created_at']);
            $table->index(['page_path', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
