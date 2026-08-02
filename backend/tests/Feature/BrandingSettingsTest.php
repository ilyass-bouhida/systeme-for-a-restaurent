<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BrandingSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpPosPermissions();
    }

    public function test_branding_is_available_before_login(): void
    {
        $this->getJson('/api/branding')
            ->assertOk()
            ->assertExactJson([
                'data' => ['restaurant_name' => 'Gigino'],
            ]);
    }

    public function test_admin_can_change_the_restaurant_name(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAsPos($admin);

        $this->putJson('/api/admin/settings', [
            'restaurant_name' => '  Atlas Bistro  ',
        ])->assertOk()
            ->assertJsonPath('data.restaurant_name', 'Atlas Bistro');

        $this->assertDatabaseHas('restaurant_settings', [
            'id' => 1,
            'restaurant_name' => 'Atlas Bistro',
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'restaurant_settings.updated',
        ]);

        $this->getJson('/api/branding')
            ->assertOk()
            ->assertJsonPath('data.restaurant_name', 'Atlas Bistro');
    }

    public function test_worker_cannot_change_restaurant_settings(): void
    {
        $this->actingAsPos($this->makeWorker());

        $this->putJson('/api/admin/settings', [
            'restaurant_name' => 'Not allowed',
        ])->assertForbidden();
    }

    public function test_restaurant_name_must_not_be_blank(): void
    {
        $this->actingAsPos($this->makeAdmin());

        $this->putJson('/api/admin/settings', [
            'restaurant_name' => '   ',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('restaurant_name');
    }
}
