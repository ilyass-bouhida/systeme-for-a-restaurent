<?php

namespace App\Providers;

use App\Contracts\CardTerminal;
use App\Contracts\CashDrawer;
use App\Contracts\ProductImageGenerator;
use App\Contracts\ReceiptPrinter;
use App\Infrastructure\Hardware\LoggingCardTerminal;
use App\Infrastructure\Hardware\LoggingCashDrawer;
use App\Infrastructure\Hardware\LoggingReceiptPrinter;
use App\Infrastructure\Images\DisabledProductImageGenerator;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ReceiptPrinter::class, LoggingReceiptPrinter::class);
        $this->app->bind(CashDrawer::class, LoggingCashDrawer::class);
        $this->app->bind(CardTerminal::class, LoggingCardTerminal::class);
        $this->app->bind(ProductImageGenerator::class, DisabledProductImageGenerator::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function (User $user): ?bool {
            return $user->hasRole('admin') ? true : null;
        });

        RateLimiter::for('api', function (Request $request): Limit {
            return Limit::perMinute(120)->by(
                $request->user()?->id ?: $request->ip(),
            );
        });

        RateLimiter::for('login', function (Request $request): Limit {
            return Limit::perMinute(5)->by(
                mb_strtolower((string) $request->input('email')).'|'.$request->ip(),
            );
        });
    }
}
