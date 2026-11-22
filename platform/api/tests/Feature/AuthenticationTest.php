<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_session_user_id_column_accepts_ulids(): void
    {
        $this->assertContains(Schema::getColumnType('sessions', 'user_id'), ['char', 'varchar', 'string']);
    }

    public function test_a_learner_can_register_but_cannot_choose_admin_role(): void
    {
        $response = $this->withHeader('Origin', 'http://localhost')->postJson('/api/v1/auth/register', [
            'name' => 'Learner', 'email' => 'learner@example.test',
            'password' => 'strong-password', 'password_confirmation' => 'strong-password',
            'role' => 'admin',
        ]);
        $response->assertCreated()->assertJsonPath('data.role', 'learner');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'learner@example.test', 'role' => 'learner']);
    }

    public function test_artisan_serve_origin_can_register_and_keep_its_session(): void
    {
        config(['sanctum.stateful' => ['127.0.0.1:8000']]);
        $response = $this->withHeader('Origin', 'http://127.0.0.1:8000')->postJson('/api/v1/auth/register', [
            'name' => 'Local Learner', 'email' => 'local@example.test',
            'password' => 'strong-password', 'password_confirmation' => 'strong-password',
        ]);

        $response->assertCreated();
        $this->assertAuthenticated();

        $this->withHeader('Origin', 'http://127.0.0.1:8000')
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'local@example.test');
    }

    public function test_registration_returns_specific_validation_errors(): void
    {
        $this->withHeader('Origin', 'http://localhost')->postJson('/api/v1/auth/register', [
            'name' => '', 'email' => 'not-an-email',
            'password' => 'short', 'password_confirmation' => 'different',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_artisan_serve_origin_can_login_and_keep_its_session(): void
    {
        config(['sanctum.stateful' => ['127.0.0.1:8000']]);
        User::factory()->create(['email' => 'login@example.test', 'password' => 'strong-password']);

        $this->withHeader('Origin', 'http://127.0.0.1:8000')->postJson('/api/v1/auth/login', [
            'email' => 'login@example.test', 'password' => 'strong-password',
        ])->assertOk()->assertJsonPath('data.email', 'login@example.test');
        $this->assertAuthenticated();

        $this->withHeader('Origin', 'http://127.0.0.1:8000')
            ->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'login@example.test');
    }
}
