<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('draft_answers', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('lesson_id')->constrained()->cascadeOnDelete();
            $table->longText('answer');
            $table->unsignedBigInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'lesson_id']);
        });
        Schema::create('attempts', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('lesson_id')->constrained()->cascadeOnDelete();
            $table->longText('answer');
            $table->string('status', 32)->default('queued')->index();
            $table->unsignedSmallInteger('overall_score')->nullable();
            $table->timestamps();
        });
        Schema::create('criterion_scores', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('rubric_criterion_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('score');
            $table->text('evidence')->nullable();
            $table->timestamps();
        });
        Schema::create('bookmarks', function (Blueprint $table): void {
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('lesson_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['user_id', 'lesson_id']);
        });
        Schema::create('notes', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('resource_type', 32);
            $table->ulid('resource_id');
            $table->longText('body');
            $table->unsignedBigInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'resource_type', 'resource_id']);
        });
        Schema::create('processed_mutations', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('idempotency_key');
            $table->string('operation');
            $table->json('response')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'idempotency_key']);
        });
        Schema::create('content_revisions', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('resource_type', 32);
            $table->ulid('resource_id');
            $table->unsignedBigInteger('version');
            $table->json('snapshot');
            $table->timestamps();
            $table->index(['resource_type', 'resource_id']);
        });
        Schema::create('admin_audit_logs', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('resource_type', 32);
            $table->ulid('resource_id')->nullable();
            $table->json('metadata')->nullable();
            $table->string('request_id', 64)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['admin_audit_logs', 'content_revisions', 'processed_mutations', 'notes', 'bookmarks', 'criterion_scores', 'attempts', 'draft_answers'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
