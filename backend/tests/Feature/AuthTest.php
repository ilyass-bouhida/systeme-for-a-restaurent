<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpPosPermissions();
    }

    public function test_active_worker_can_log_in_and_read_profile(): void
    {
        $worker = User::factory()->create([
            'email' => 'worker@gigino.test',
            'password' => Hash::make('StrongPass123'),
        ]);
        $worker->assignRole('worker');

        $login = $this->postJson('/api/auth/login', [
            'email' => 'worker@gigino.test',
            'password' => 'StrongPass123',
            'device_name' => 'front-counter',
        ]);

        $login->assertOk()
            ->assertJsonPath('user.email', 'worker@gigino.test')
            ->assertJsonStructure(['token', 'user' => ['roles', 'permissions']]);

        $this->withToken($login->json('token'))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'worker@gigino.test');
    }

    public function test_invalid_credentials_and_inactive_users_are_rejected(): void
    {
        User::factory()->create([
            'email' => 'inactive@gigino.test',
            'password' => Hash::make('StrongPass123'),
            'is_active' => false,
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'inactive@gigino.test',
            'password' => 'StrongPass123',
        ])->assertUnprocessable();

        $this->postJson('/api/auth/login', [
            'email' => 'inactive@gigino.test',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    public function test_worker_can_manage_own_profile_securely(): void
    {
        $worker = $this->makeWorker();
        $worker->update(['password' => 'StrongPass123']);
        $this->actingAsPos($worker);

        $this->patchJson('/api/auth/profile', [
            'name' => 'Updated Worker',
            'email' => 'updated-worker@gigino.test',
            'current_password' => 'StrongPass123',
            'password' => 'NewStrongPass456',
            'password_confirmation' => 'NewStrongPass456',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Updated Worker')
            ->assertJsonPath('data.email', 'updated-worker@gigino.test');

        $this->assertTrue(Hash::check('NewStrongPass456', $worker->refresh()->password));
    }
}
