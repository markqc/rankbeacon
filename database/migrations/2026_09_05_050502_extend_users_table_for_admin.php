<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email_normalized')->nullable()->unique()->after('email');
            $table->string('status', 32)->default('active')->after('email_normalized');
            $table->timestamp('password_changed_at')->nullable()->after('password');
            $table->softDeletes()->after('updated_at');
        });

        DB::table('users')->update(['email_normalized' => DB::raw('LOWER(email)')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_normalized', 'status', 'password_changed_at', 'deleted_at']);
        });
    }
};
