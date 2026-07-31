<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpPosPermissions();
        $this->actingAsPos($this->makeAdmin());
    }

    public function test_admin_can_manage_categories_products_and_tables(): void
    {
        $category = $this->postJson('/api/admin/categories', [
            'name' => 'Desserts',
            'display_order' => 3,
        ])->assertCreated()->json('data');

        $product = $this->postJson('/api/admin/products', [
            'category_id' => $category['id'],
            'name' => 'Tiramisu',
            'description' => 'House recipe',
            'price_cents' => 4200,
            'cost_cents' => 1400,
            'is_active' => true,
        ])->assertCreated()
            ->assertJsonPath('data.price_cents', 4200)
            ->assertJsonPath('data.cost_cents', 1400)
            ->json('data');

        $this->patchJson('/api/admin/products/'.$product['id'], [
            'price_cents' => 4500,
            'cost_cents' => 1500,
        ])->assertOk()
            ->assertJsonPath('data.price_cents', 4500)
            ->assertJsonPath('data.cost_cents', 1500);

        $table = $this->postJson('/api/admin/tables', [
            'label' => 'Terrace 1',
            'capacity' => 4,
        ])->assertCreated()->json('data');

        $this->patchJson('/api/admin/tables/'.$table['id'], [
            'label' => 'Terrace A',
        ])->assertOk()->assertJsonPath('data.label', 'Terrace A');

        $this->deleteJson('/api/admin/products/'.$product['id'])->assertNoContent();
        $this->deleteJson('/api/admin/categories/'.$category['id'])->assertNoContent();
        $this->deleteJson('/api/admin/tables/'.$table['id'])->assertNoContent();
    }

    public function test_admin_can_create_worker_with_selected_permissions(): void
    {
        $response = $this->postJson('/api/admin/users', [
            'name' => 'Youssef',
            'email' => 'youssef@gigino.test',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'role' => 'worker',
            'permissions' => ['cashier.access', 'orders.manage'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'youssef@gigino.test')
            ->assertJsonPath('data.roles.0', 'worker')
            ->assertJsonCount(2, 'data.permissions');
    }
}
