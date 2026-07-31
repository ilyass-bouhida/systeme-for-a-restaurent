import { format } from "date-fns";

export function formatDateTime(value: string): string {
  return format(new Date(value), "dd MMM yyyy · HH:mm");
}
