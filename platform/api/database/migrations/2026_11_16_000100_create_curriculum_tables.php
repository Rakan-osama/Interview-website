<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
        Schema::create('tracks', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('legacy_key')->unique();
            $table->string('title');
            $table->string('title_ar')->nullable();
            $table->text('description')->nullable();
            $table->string('color', 32)->nullable();
            $table->string('icon', 64)->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
        Schema::create('lessons', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('track_id')->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('legacy_key')->unique();
            $table->string('title');
            $table->text('objective')->nullable();
            $table->longText('explanation');
            $table->longText('plain_explanation')->nullable();
            $table->longText('practical_example')->nullable();
            $table->text('interview_question');
            $table->longText('model_answer');
            $table->longText('code')->nullable();
            $table->longText('reference_solution')->nullable();
            $table->longText('common_mistake')->nullable();
            $table->longText('pitfall')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->unsignedBigInteger('version')->default(1);
            $table->timestamps();
            $table->unique(['track_id', 'slug']);
        });
        Schema::create('rubric_criteria', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->json('terms')->nullable();
            $table->unsignedInteger('weight')->default(1);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
        Schema::create('concepts', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('legacy_key')->unique();
            $table->string('title');
            $table->string('group_name')->nullable();
            $table->longText('content');
            $table->unsignedBigInteger('version')->default(1);
            $table->timestamps();
        });
        Schema::create('concept_lesson', function (Blueprint $table): void {
            $table->foreignUlid('concept_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('lesson_id')->constrained()->cascadeOnDelete();
            $table->primary(['concept_id', 'lesson_id']);
        });
        Schema::create('feature_guides', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('slug')->unique();
            $table->string('legacy_key')->unique();
            $table->string('title');
            $table->string('domain')->nullable();
            $table->text('summary')->nullable();
            $table->string('simulator_key')->nullable();
            $table->unsignedBigInteger('version')->default(1);
            $table->timestamps();
        });
        Schema::create('guide_sections', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('feature_guide_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('title')->nullable();
            $table->json('content');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_sections');
        Schema::dropIfExists('feature_guides');
        Schema::dropIfExists('concept_lesson');
        Schema::dropIfExists('concepts');
        Schema::dropIfExists('rubric_criteria');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('tracks');
        Schema::dropIfExists('categories');
    }
};
