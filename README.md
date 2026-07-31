# Gigino Restaurant POS

Gigino is a full-stack restaurant caisse system built with:

- React, TypeScript, Vite, and Tailwind CSS
- Laravel, Sanctum, policies, rate limits, queues, and Reverb
- MySQL for production data

The system includes table status, categorized products, order quantities,
hold/resume, cash and card payment, change calculation, receipt printing,
cash-drawer and terminal adapters, worker totals, admin permissions, and
day/week/month/year analytics. Product selling price and cost are tracked
separately, with immutable order cost snapshots for accurate historical gross
profit. The admin dashboard also reports visitors, average ticket, payment
methods, product profitability, worker/table performance, and live revenue.
Every worker has a secure self-service profile.

## Project folders

- `frontend/` — touch-friendly cashier and admin interface
- `backend/` — secure Laravel API and domain services
- `docs/` — architecture, API contract, deployment, and testing decisions

The earlier vinext starter remains in the repository root only as preserved
workspace history. Gigino's active applications are `frontend/` and `backend/`.

## Local setup

### Backend

```powershell
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
php artisan reverb:start --host=127.0.0.1 --port=8080
```

For quick local work, SQLite may be used by setting `DB_CONNECTION=sqlite`. The
production configuration and Docker service use MySQL.

### Frontend

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`.

Local seeded accounts:

- Admin: `admin@gigino.local`
- Cashier: `cashier@gigino.local`
- Local default password: `GiginoDemo!2026`

Change the seed password and all seeded credentials before production use.

## Quality checks

```powershell
cd backend
php vendor/bin/pint --test
php artisan test

cd ../frontend
npm run check
npm run build
```

Read [docs/architecture.md](docs/architecture.md) before extending a feature.
