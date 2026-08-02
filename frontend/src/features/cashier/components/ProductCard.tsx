import type { Product } from "@/types/api";
import { formatMoney } from "@/utils/money";
import { ImageOff, Plus } from "lucide-react";

export function ProductCard({
  product,
  onAdd,
  disabled,
}: {
  product: Product;
  onAdd: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onAdd}
      disabled={disabled}
      aria-label={`Add ${product.name} for ${formatMoney(product.price_cents)}`}
      className="group border-gigino-line hover:border-gigino-tomato/40 overflow-hidden rounded-[16px] border bg-white text-left shadow-[var(--gigino-shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--gigino-shadow-floating)] focus-visible:ring-4 focus-visible:ring-red-100 focus-visible:outline-none disabled:opacity-50"
    >
      <div className="bg-gigino-subtle relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-gigino-muted grid size-full place-items-center">
            <ImageOff className="size-7" />
          </div>
        )}
      </div>
      <div className="p-3">
        {product.category_name && (
          <p className="text-gigino-tomato mb-1 text-[10px] font-black tracking-[0.12em] uppercase">
            {product.category_name}
          </p>
        )}
        <h3 className="text-gigino-ink line-clamp-1 text-sm font-extrabold">
          {product.name}
        </h3>
        <p className="text-gigino-muted mt-1 line-clamp-1 text-xs">
          {product.description ?? "Restaurant menu item"}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-gigino-ink text-base font-black">
            {formatMoney(product.price_cents)}
          </p>
          <span className="bg-gigino-tomato group-hover:bg-gigino-tomato-dark grid size-10 place-items-center rounded-[11px] text-white shadow-sm transition">
            <Plus className="size-4.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
