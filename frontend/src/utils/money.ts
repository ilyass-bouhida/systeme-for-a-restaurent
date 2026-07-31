export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function dirhamsToCents(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

export function calculateChange(totalCents: number, paidCents: number): number {
  return Math.max(0, paidCents - totalCents);
}
