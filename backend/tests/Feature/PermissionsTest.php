<?php

namespace Tests\Feature;

use App\Support\Permissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpPosPermissions();
    }

    public function test_worker_cannot_access_admin_routes(): void
    {
        $this->actingAsPos($this->makeWorker());

        $this->getJson('/api/admin/dashboard')->assertForbidden();
        $this->postJson('/api/admin/categories', ['name' => 'Private'])
            ->assertForbidden();
    }

    public function test_custom_worker_permissions_are_enforced(): void
    {
        $worker = $this->makeWorker([Permissions::CASHIER_ACCESS]);
        $this->actingAsPos($worker);

        $this->getJson('/api/tables')->assertOk();
        $this->getJson('/api/orders')->assertForbidden();
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $this->actingAsPos($this->makeAdmin());

        $this->getJson('/api/admin/dashboard')->assertOk();
    }
}
