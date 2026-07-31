# Gigino POS Architecture

## 1. System Architecture

Gigino is a two-application monorepo:

- `frontend/`: React, TypeScript, Vite, and Tailwind CSS.
- `backend/`: Laravel API, Sanctum authentication, MySQL, queues, policies, and
  Reverb broadcasting.

The browser never receives database credentials, hardware secrets, image
generation keys, or third-party payment keys. It communicates only with the
Laravel API over HTTPS. Laravel validates every request, authorizes the current
user, writes the transaction, and dispatches hardware or realtime work.

```text
React POS
   |
   | HTTPS + Sanctum bearer token
   v
Laravel API
   |-- Policies and permissions
   |-- Domain services
   |-- MySQL transactions
   |-- Reverb events
   |-- Receipt / drawer / terminal adapters
   `-- Backend-only image generation adapter
```

### Security boundaries

- Passwords are hashed by Laravel.
- Authentication uses revocable Sanctum tokens.
- API routes are rate limited.
- Controllers accept validated Form Request data only.
- Policies and permission middleware protect privileged actions.
- Payments are completed inside database transactions with row locks.
- Money is stored as integer centimes, never floating point.
- Secrets live only in the backend environment.
- Production CORS accepts only the configured frontend origin.

## 2. Database Schema

| Table | Purpose |
| --- | --- |
| `users` | Workers and admins, active state, email, password |
| `roles`, `permissions`, pivots | Role and per-user permission assignments |
| `categories` | Menu grouping and display order |
| `products` | Dishes and drinks, image, price in centimes, active state |
| `restaurant_tables` | Table label, capacity, availability, revenue source |
| `orders` | Table order, worker, lifecycle status, totals, timestamps |
| `order_items` | Product snapshot, quantity, price, line total |
| `payments` | Cash/card payment, paid amount, change, transaction reference |
| `receipts` | Immutable receipt number and printable payload snapshot |
| `activity_logs` | Auditable operational activity |
| `personal_access_tokens` | Sanctum API sessions |

Important constraints:

- One table can have at most one active or held order.
- Product and order money fields are unsigned integers in centimes.
- Receipt numbers are unique.
- Foreign keys use restrictive or nulling deletes to protect financial history.
- Reporting indexes cover dates, workers, tables, statuses, and products.

The detailed column-level schema is implemented in
`backend/database/migrations`.

## 3. Folder Structure

```text
restaurant-pos-system/
  docs/                       Architecture and implementation decisions
  frontend/
    src/
      app/                    Router and application providers
      components/             Shared reusable interface components
      features/               Auth, cashier, orders, admin, reports
      hooks/                  Shared React hooks
      layouts/                Cashier and admin shells
      pages/                  Route-level screens
      services/               Typed API and realtime clients
      stores/                 Small UI/session stores
      tests/                  Test setup and fixtures
      types/                  API and domain types
      utils/                  Money, dates, permissions, errors
  backend/
    app/
      Contracts/              Hardware and image-provider interfaces
      Events/                 Realtime domain events
      Http/Controllers/Api/   Thin HTTP controllers
      Http/Requests/          Input validation
      Http/Resources/         Stable JSON responses
      Models/                 Eloquent models
      Policies/               Record-level authorization
      Services/               Orders, payments, reports, receipts, hardware
    database/
      factories/
      migrations/
      seeders/
    routes/api.php
    tests/Feature/
    tests/Unit/
```

## 4. React Application Structure

The React app is organized by business feature. A feature owns its API hooks,
components, schemas, and tests. Route pages compose features but do not contain
payment or order business rules. TanStack Query owns server state; Zustand is
reserved for the current cashier draft and small UI state.

Main routes:

- `/login`
- `/cashier/tables`
- `/cashier/tables/:tableId/order`
- `/cashier/orders`
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/tables`
- `/admin/workers`
- `/admin/reports`

## 5. Laravel API Structure

Controllers are transport adapters. Form Requests validate payloads, policies
authorize records, and services execute business operations. Payment and hold
operations use database transactions and pessimistic locks to prevent duplicate
payments or conflicting table sessions.

API groups:

- `/api/auth`
- `/api/tables`
- `/api/menu`
- `/api/orders`
- `/api/payments`
- `/api/receipts`
- `/api/stats`
- `/api/admin/users`
- `/api/admin/categories`
- `/api/admin/products`
- `/api/admin/tables`
- `/api/admin/reports`

## 6. Roles and Permissions

Roles:

- `admin`: receives every permission.
- `worker`: receives cashier permissions by default.

Permissions:

- `cashier.access`
- `orders.manage`
- `reports.view`
- `products.view`, `products.create`, `products.update`, `products.delete`
- `categories.manage`
- `tables.manage`
- `users.manage`
- `permissions.manage`
- `payments.process`
- `receipts.reprint`

The admin may grant or revoke individual worker permissions. Frontend visibility
is a convenience only; every permission is enforced again by Laravel.

## 7. Main User Flows

### Worker

1. Sign in and receive a Sanctum token.
2. Open the table grid and see live available, occupied, or red held states.
3. Select a table and start or resume its open order.
4. Add categorized products and adjust quantities.
5. Hold the order, or select cash/card and complete payment.
6. Cash payment calculates change, stores the receipt, prints, and asks the
   drawer adapter to open.
7. Card payment completes only after the terminal adapter succeeds.
8. Return to the table grid or reprint a receipt from Orders.

### Admin

1. Sign in to the admin dashboard.
2. Monitor tables, activity, worker totals, and revenue.
3. Manage workers and their permissions.
4. Manage categories, products, and tables.
5. Review orders, payments, receipts, and time-range reports.

## 8. Hardware Integration

Laravel depends on interfaces:

- `ReceiptPrinter`
- `CashDrawer`
- `CardTerminal`

Development uses logging adapters. Production can bind ESC/POS printer and
drawer implementations or a local hardware bridge. The card adapter can later
be replaced by a terminal vendor implementation. Payment records are committed
once; hardware failures are logged and can be retried without charging twice.

## 9. Realtime Approach

Laravel Reverb broadcasts private restaurant events after database commit:

- table status changed
- order held/resumed/paid
- payment completed
- worker activity changed

The React client uses Laravel Echo to invalidate the affected TanStack Query
caches. It also performs a slower fallback refresh so the interface remains
correct if a websocket connection is temporarily unavailable.

## 10. Testing Strategy

- Unit tests cover totals, change calculation, receipt snapshots, and report
  aggregation.
- Laravel feature tests cover authentication, permissions, CRUD, order
  lifecycle, payments, receipts, worker stats, and analytics.
- React component tests cover login, table status, categorized products, cart
  quantities, hold, payment input, change, and permission-aware navigation.
- Integration tests use SQLite in memory for speed; production uses MySQL.
- CI runs Laravel tests, Pint, TypeScript, ESLint, Vitest, and the production
  frontend build.
