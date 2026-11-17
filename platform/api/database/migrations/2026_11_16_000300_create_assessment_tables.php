<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assessment_jobs', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('attempt_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('provider', 32);
            $table->string('model')->nullable();
            $table->string('status', 32)->default('queued')->index();
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->text('failure_code')->nullable();
            $table->text('failure_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
        Schema::create('assessment_results', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('assessment_job_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('overall_score');
            $table->json('criterion_scores');
            $table->json('strengths');
            $table->json('gaps');
            $table->json('next_steps');
            $table->decimal('confidence', 4, 3);
            $table->json('raw_metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_results');
        Schema::dropIfExists('assessment_jobs');
    }
};
