<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_sources', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('source_key')->unique();
            $table->string('title');
            $table->string('publisher');
            $table->text('url');
            $table->string('applicable_version')->nullable();
            $table->string('section_locator')->nullable();
            $table->date('reviewed_at');
            $table->timestamps();
        });

        Schema::create('concept_claims', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('concept_id')->constrained()->cascadeOnDelete();
            $table->string('claim_key');
            $table->text('statement');
            $table->json('evidence_groups');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['concept_id', 'claim_key']);
        });

        Schema::create('rubric_criterion_claim', function (Blueprint $table): void {
            $table->foreignUlid('rubric_criterion_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('concept_claim_id')->constrained()->cascadeOnDelete();
            $table->primary(['rubric_criterion_id', 'concept_claim_id']);
        });

        Schema::create('content_source_links', function (Blueprint $table): void {
            $table->foreignUlid('content_source_id')->constrained()->cascadeOnDelete();
            $table->string('resource_type', 32);
            $table->ulid('resource_id');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->unique(['content_source_id', 'resource_type', 'resource_id'], 'content_source_resource_unique');
            $table->index(['resource_type', 'resource_id']);
        });

        Schema::create('lesson_visuals', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 32);
            $table->string('title');
            $table->text('caption');
            $table->text('alt_text');
            $table->json('data');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::table('rubric_criteria', function (Blueprint $table): void {
            $table->text('description')->nullable()->after('label');
            $table->json('evidence_groups')->nullable()->after('terms');
        });
    }

    public function down(): void
    {
        Schema::table('rubric_criteria', function (Blueprint $table): void {
            $table->dropColumn(['description', 'evidence_groups']);
        });
        Schema::dropIfExists('lesson_visuals');
        Schema::dropIfExists('content_source_links');
        Schema::dropIfExists('rubric_criterion_claim');
        Schema::dropIfExists('concept_claims');
        Schema::dropIfExists('content_sources');
    }
};
