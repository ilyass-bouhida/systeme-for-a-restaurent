<?php

namespace Tests;

use App\Models\Category;
use App\Models\Product;
use App\Models\RestaurantTable;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

abstract class TestCase extends BaseTestCase
{
    protected function setUpPosPermissions(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Permissions::all() as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::findOrCreate('admin', 'web')->syncPermissions(Permissions::all());
        Role::findOrCreate('worker', 'web')->syncPermissions([]);
    }

    protected function makeAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    /**
     * @param  list<string>|null  $permissions
     */
    protected function makeWorker(?array $permissions = null): User
    {
        $user = User::factory()->create();
        $user->assignRole('worker');
        $user->syncPermissions($permissions ?? Permissions::workerDefaults());

        return $user;
    }

    protected function actingAsPos(User $user): void
    {
        Sanctum::actingAs($user, ['pos:access']);
    }

    /**
     * @return array{0: Category, 1: Product}
     */
    protected function makeProduct(int $priceCents = 2500, int $costCents = 800): array
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create([
            'price_cents' => $priceCents,
            'cost_cents' => $costCents,
        ]);

        return [$category, $product];
    }

    protected function makeTable(): RestaurantTable
    {
        return RestaurantTable::factory()->create();
    }
}
