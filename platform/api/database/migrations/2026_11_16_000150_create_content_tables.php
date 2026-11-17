<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('legacy_key')->unique();
            $table->string('title');
            $table->string('type', 32)->nullable();
            $table->text('url')->nullable();
            $table->longText('description')->nullable();
            $table->timestamps();
        });
        Schema::create('projects', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('legacy_key')->unique();
            $table->string('title');
            $table->longText('description')->nullable();
            $table->json('content');
            $table->timestamps();
        });
        Schema::create('simulator_references', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('key')->unique();
            $table->string('module');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulator_references');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('resources');
    }
};
