# Gigino API Contract

All successful endpoints return JSON. Validation failures use Laravel's standard
`422` error shape. Unauthorized, forbidden, missing, and throttled requests use
`401`, `403`, `404`, and `429`.

## Authentication

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Cashier

- `GET /api/tables`
- `GET /api/menu`
- `POST /api/tables/{table}/orders`
- `GET /api/orders`
- `GET /api/orders/{order}`
- `POST /api/orders/{order}/items`
- `PATCH /api/orders/{order}/items/{item}`
- `DELETE /api/orders/{order}/items/{item}`
- `POST /api/orders/{order}/hold`
- `POST /api/orders/{order}/resume`
- `POST /api/orders/{order}/pay`
- `GET /api/receipts/{receipt}`
- `POST /api/receipts/{receipt}/print`
- `GET /api/stats/me`

## Admin

- CRUD `/api/admin/users`
- CRUD `/api/admin/categories`
- CRUD `/api/admin/products`
- CRUD `/api/admin/tables`
- `GET /api/admin/dashboard`
- `GET /api/admin/reports?period=day|week|month|year`

Amounts use integer centimes in request/response payloads. The frontend formats
them as Moroccan dirhams (`MAD`) by default.
