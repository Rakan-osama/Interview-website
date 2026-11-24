<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table): void {
            $table->json('learning_content')->nullable()->after('pitfall');
            $table->string('content_depth', 16)->default('full')->after('learning_content');
            $table->timestamp('retired_at')->nullable()->after('content_depth');
            $table->foreignUlid('superseded_by_lesson_id')->nullable()->after('retired_at')
                ->constrained('lessons')->nullOnDelete();
            $table->text('retirement_reason')->nullable()->after('superseded_by_lesson_id');
            $table->index(['track_id', 'retired_at']);
        });
    }

    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table): void {
            $table->dropIndex(['track_id', 'retired_at']);
            $table->dropConstrainedForeignId('superseded_by_lesson_id');
            $table->dropColumn(['learning_content', 'content_depth', 'retired_at', 'retirement_reason']);
        });
    }
};
