<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checklist_items', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('resource_type', 32);
            $table->ulid('resource_id');
            $table->string('item_key');
            $table->boolean('completed')->default(false);
            $table->timestamps();
            $table->unique(['user_id', 'resource_type', 'resource_id', 'item_key'], 'checklist_unique');
        });
        Schema::create('reading_states', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('resource_type', 32);
            $table->ulid('resource_id');
            $table->unsignedSmallInteger('progress')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'resource_type', 'resource_id']);
        });
        Schema::create('user_preferences', function (Blueprint $table): void {
            $table->foreignUlid('user_id')->primary()->constrained()->cascadeOnDelete();
            $table->string('locale', 10)->default('en');
            $table->string('theme', 16)->default('system');
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('reading_states');
        Schema::dropIfExists('checklist_items');
    }
};
