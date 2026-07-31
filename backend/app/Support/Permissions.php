<?php

namespace App\Support;

final class Permissions
{
    public const CASHIER_ACCESS = 'cashier.access';

    public const ORDERS_MANAGE = 'orders.manage';

    public const PAYMENTS_PROCESS = 'payments.process';

    public const RECEIPTS_REPRINT = 'receipts.reprint';

    public const REPORTS_VIEW = 'reports.view';

    public const PRODUCTS_VIEW = 'products.view';

    public const PRODUCTS_CREATE = 'products.create';

    public const PRODUCTS_UPDATE = 'products.update';

    public const PRODUCTS_DELETE = 'products.delete';

    public const CATEGORIES_MANAGE = 'categories.manage';

    public const TABLES_MANAGE = 'tables.manage';

    public const USERS_MANAGE = 'users.manage';

    public const PERMISSIONS_MANAGE = 'permissions.manage';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::CASHIER_ACCESS,
            self::ORDERS_MANAGE,
            self::PAYMENTS_PROCESS,
            self::RECEIPTS_REPRINT,
            self::REPORTS_VIEW,
            self::PRODUCTS_VIEW,
            self::PRODUCTS_CREATE,
            self::PRODUCTS_UPDATE,
            self::PRODUCTS_DELETE,
            self::CATEGORIES_MANAGE,
            self::TABLES_MANAGE,
            self::USERS_MANAGE,
            self::PERMISSIONS_MANAGE,
        ];
    }

    /**
     * @return list<string>
     */
    public static function workerDefaults(): array
    {
        return [
            self::CASHIER_ACCESS,
            self::ORDERS_MANAGE,
            self::PAYMENTS_PROCESS,
            self::RECEIPTS_REPRINT,
            self::PRODUCTS_VIEW,
        ];
    }
}
