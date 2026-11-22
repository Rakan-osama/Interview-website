<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('legacy_imports', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('source', 64);
            $table->char('payload_hash', 64);
            $table->json('totals');
            $table->timestamps();
            $table->unique(['user_id', 'source', 'payload_hash'], 'legacy_import_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('legacy_imports');
    }
};
