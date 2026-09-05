<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getColumnType('passkeys', 'credential_id') === 'text') {
            Schema::table('passkeys', function (Blueprint $table) {
                $table->string('credential_id', 512)->change();
            });
        }

        $hasIndex = collect(Schema::getIndexes('passkeys'))
            ->contains('name', 'passkeys_credential_id_unique');

        if (! $hasIndex) {
            Schema::table('passkeys', function (Blueprint $table) {
                $table->unique('credential_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('passkeys', function (Blueprint $table) {
            $table->dropUnique(['credential_id']);
            $table->text('credential_id')->change();
        });
    }
};
