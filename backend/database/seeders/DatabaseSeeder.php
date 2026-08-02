<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\RestaurantSetting;
use App\Models\RestaurantTable;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        RestaurantSetting::query()->firstOrCreate(
            ['id' => RestaurantSetting::SINGLETON_ID],
            ['restaurant_name' => 'Gigino'],
        );

        foreach (Permissions::all() as $permission) {
            Permission::query()->firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        $adminRole = Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $workerRole = Role::query()->firstOrCreate(['name' => 'worker', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permissions::all());
        $workerRole->syncPermissions([]);

        $password = (string) env('GIGINO_SEED_PASSWORD', 'GiginoDemo!2026');

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@gigino.local'],
            [
                'name' => 'Gigino Admin',
                'password' => Hash::make($password),
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
        $admin->syncRoles([$adminRole]);

        $worker = User::query()->updateOrCreate(
            ['email' => 'cashier@gigino.local'],
            [
                'name' => 'Sara',
                'password' => Hash::make($password),
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
        $worker->syncRoles([$workerRole]);
        $worker->syncPermissions(Permissions::workerDefaults());

        $catalogue = [
            'Pizzas' => [
                ['Margherita', 7500, 2600, 'Tomato, mozzarella, basil and olive oil.', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80'],
                ['Diavola', 8900, 3300, 'Spicy salami, mozzarella and tomato.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80'],
            ],
            'Pasta' => [
                ['Tagliatelle al pesto', 8500, 2800, 'Fresh basil pesto and parmesan.', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80'],
                ['Spaghetti carbonara', 9200, 3100, 'Egg, pecorino and smoked beef.', 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80'],
            ],
            'Main dishes' => [
                ['Gigino burger', 7800, 3000, 'Beef, provolone, lettuce and house sauce.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80'],
                ['Caesar salad', 5600, 1900, 'Crisp lettuce, chicken, parmesan and croutons.', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80'],
            ],
            'Desserts' => [
                ['Tiramisu', 4200, 1400, 'Classic mascarpone and coffee dessert.', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80'],
            ],
            'Drinks' => [
                ['Espresso', 1800, 300, 'Freshly ground Italian coffee.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80'],
                ['Fresh orange juice', 2800, 900, 'Pressed to order.', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80'],
                ['Still water', 1200, 350, '50 cl bottle.', 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80'],
            ],
        ];

        $categoryOrder = 0;
        foreach ($catalogue as $categoryName => $products) {
            $category = Category::query()->updateOrCreate(
                ['slug' => Str::slug($categoryName)],
                [
                    'name' => $categoryName,
                    'display_order' => $categoryOrder++,
                    'is_active' => true,
                ],
            );

            foreach ($products as $productOrder => [$name, $price, $cost, $description, $image]) {
                Product::query()->updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'category_id' => $category->id,
                        'name' => $name,
                        'description' => $description,
                        'price_cents' => $price,
                        'cost_cents' => $cost,
                        'image_path' => $image,
                        'is_active' => true,
                        'display_order' => $productOrder,
                    ],
                );
            }
        }

        foreach (range(1, 12) as $number) {
            RestaurantTable::query()->updateOrCreate(
                ['label' => 'Table '.$number],
                [
                    'capacity' => $number % 4 === 0 ? 6 : 4,
                    'is_active' => true,
                    'display_order' => $number,
                ],
            );
        }
    }
}
