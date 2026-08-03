# Gigino API Contract

All successful endpoints return JSON. Validation failures use Laravel's standard
`422` error shape. Unauthorized, forbidden, missing, and throttled requests use
`401`, `403`, `404`, and `429`.

## Authentication

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Public branding

- `GET /api/branding`

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
- `GET /api/admin/reports?period=day|week|month|year&year=YYYY&month=1..12`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

Amounts use integer centimes in request/response payloads. The frontend formats
them as Moroccan dirhams (`MAD`) by default.

For calendar filtering, `month` uses the selected month and year, while `year`
uses the complete selected year. The API applies an exclusive end date so data
from the following month or year is never included.
