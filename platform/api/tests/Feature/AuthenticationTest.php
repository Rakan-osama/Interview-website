<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

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
}
