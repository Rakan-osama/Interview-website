<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competencies', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('summary');
            $table->json('outcomes');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('competency_modules', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('competency_id')->constrained()->cascadeOnDelete();
            $table->string('module_key');
            $table->string('title');
            $table->text('summary');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['competency_id', 'module_key']);
        });

        Schema::create('competency_module_lesson', function (Blueprint $table): void {
            $table->foreignUlid('competency_module_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('lesson_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_required')->default(true);
            $table->unsignedInteger('position')->default(0);
            $table->primary(['competency_module_id', 'lesson_id'], 'competency_module_lesson_primary');
        });

        Schema::create('concept_claim_source', function (Blueprint $table): void {
            $table->foreignUlid('concept_claim_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('content_source_id')->constrained()->cascadeOnDelete();
            $table->string('section_locator')->nullable();
            $table->text('support_note');
            $table->timestamp('verified_at');
            $table->primary(['concept_claim_id', 'content_source_id'], 'concept_claim_source_primary');
        });

        Schema::create('content_reviews', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('resource_type', 32);
            $table->ulid('resource_id');
            $table->string('status', 32)->default('draft')->index();
            $table->foreignUlid('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('content_hash', 64);
            $table->text('notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->unique(['resource_type', 'resource_id'], 'content_review_resource_unique');
        });

        Schema::table('lesson_visuals', function (Blueprint $table): void {
            $table->unsignedSmallInteger('schema_version')->default(1)->after('kind');
            $table->string('layout', 32)->nullable()->after('schema_version');
            $table->string('fingerprint', 64)->nullable()->unique()->after('data');
        });
    }

    public function down(): void
    {
        Schema::table('lesson_visuals', function (Blueprint $table): void {
            $table->dropUnique(['fingerprint']);
            $table->dropColumn(['schema_version', 'layout', 'fingerprint']);
        });
        Schema::dropIfExists('content_reviews');
        Schema::dropIfExists('concept_claim_source');
        Schema::dropIfExists('competency_module_lesson');
        Schema::dropIfExists('competency_modules');
        Schema::dropIfExists('competencies');
    }
};
