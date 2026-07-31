<?php

use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ReportController;
use App\Http\Controllers\Api\Admin\TableController as AdminTableController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\OrderLifecycleController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\TableController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
});

Route::middleware(['auth:sanctum', 'active', 'throttle:api'])->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('profile', [ProfileController::class, 'update']);
        Route::post('logout', [AuthController::class, 'logout']);
    });

    Route::middleware('permission:cashier.access')->group(function (): void {
        Route::get('tables', [TableController::class, 'index']);
        Route::get('menu', [MenuController::class, 'index']);
        Route::get('stats/me', [StatsController::class, 'me']);
    });

    Route::middleware('permission:orders.manage')->group(function (): void {
        Route::get('orders', [OrderController::class, 'index']);
        Route::post('tables/{table}/orders', [OrderController::class, 'store']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::patch('orders/{order}/guests', [OrderController::class, 'updateGuests']);
        Route::post('orders/{order}/items', [OrderItemController::class, 'store']);
        Route::patch('orders/{order}/items/{item}', [OrderItemController::class, 'update']);
        Route::delete('orders/{order}/items/{item}', [OrderItemController::class, 'destroy']);
        Route::post('orders/{order}/hold', [OrderLifecycleController::class, 'hold']);
        Route::post('orders/{order}/resume', [OrderLifecycleController::class, 'resume']);
    });

    Route::post('orders/{order}/pay', [PaymentController::class, 'store'])
        ->middleware('permission:payments.process');

    Route::get('receipts/{receipt}', [ReceiptController::class, 'show'])
        ->middleware('permission:receipts.reprint');
    Route::post('receipts/{receipt}/print', [ReceiptController::class, 'print'])
        ->middleware('permission:receipts.reprint');

    Route::prefix('admin')->middleware('role:admin')->group(function (): void {
        Route::get('dashboard', DashboardController::class);
        Route::get('reports', ReportController::class);
        Route::apiResource('users', AdminUserController::class);
        Route::apiResource('categories', AdminCategoryController::class);
        Route::apiResource('products', AdminProductController::class);
        Route::apiResource('tables', AdminTableController::class)
            ->parameters(['tables' => 'table']);
    });
});
