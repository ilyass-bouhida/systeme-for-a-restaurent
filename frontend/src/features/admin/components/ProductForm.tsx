import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ProductInput } from "@/features/admin/admin-api";
import type { Category, Product } from "@/types/api";
import { dirhamsToCents, formatMoney } from "@/utils/money";
import { useState, type FormEvent } from "react";

export function ProductForm({
  product,
  categories,
  busy,
  onSubmit,
}: {
  product?: Product | null;
  categories: Category[];
  busy?: boolean;
  onSubmit: (input: ProductInput) => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.category_id ?? categories[0]?.id ?? 0,
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? String(product.price_cents / 100) : "",
  );
  const [cost, setCost] = useState(
    product ? String((product.cost_cents ?? 0) / 100) : "",
  );
  const [active, setActive] = useState(product?.is_active ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [generateImage, setGenerateImage] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      category_id: categoryId,
      description,
      price_cents: dirhamsToCents(price),
      cost_cents: dirhamsToCents(cost),
      is_active: active,
      image,
      generate_image: generateImage,
      image_prompt: generateImage
        ? `${name}, restaurant menu photography`
        : undefined,
    });
  };

  const priceCents = dirhamsToCents(price);
  const costCents = dirhamsToCents(cost);
  const grossProfitCents = Math.max(0, priceCents - costCents);
  const margin =
    priceCents > 0
      ? Math.round((grossProfitCents / priceCents) * 1000) / 10
      : 0;

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <Input
        label="Product name"
        value={name}
        required
        onChange={(event) => setName(event.target.value)}
      />
      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Category
        <select
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-3.5 outline-none focus:ring-4 focus:ring-stone-200"
          value={categoryId}
          onChange={(event) => setCategoryId(Number(event.target.value))}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Description
        <textarea
          className="min-h-24 resize-y rounded-xl border border-stone-200 bg-white p-3.5 outline-none focus:ring-4 focus:ring-stone-200"
          value={description}
          maxLength={2000}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <Input
        label="Selling price (MAD)"
        type="number"
        min="0.01"
        step="0.01"
        required
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />
      <Input
        label="Product cost (MAD)"
        type="number"
        min="0"
        max={price || undefined}
        step="0.01"
        required
        value={cost}
        onChange={(event) => setCost(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900">
        <div>
          <p className="text-xs font-bold text-emerald-700">
            Gross profit / sale
          </p>
          <p className="mt-1 text-lg font-black">
            {formatMoney(grossProfitCents)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-700">Gross margin</p>
          <p className="mt-1 text-lg font-black">{margin}%</p>
        </div>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-stone-700">
        Product image
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm"
          onChange={(event) => setImage(event.target.files?.[0] ?? null)}
        />
      </label>
      <div className="grid gap-3 rounded-2xl bg-stone-50 p-4">
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            className="size-5 accent-stone-950"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          Available in cashier menu
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            className="size-5 accent-stone-950"
            checked={generateImage}
            disabled={Boolean(image)}
            onChange={(event) => setGenerateImage(event.target.checked)}
          />
          Generate image through backend provider
        </label>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={busy || categories.length === 0}
      >
        {busy ? "Saving…" : product ? "Save changes" : "Add product"}
      </Button>
    </form>
  );
}
