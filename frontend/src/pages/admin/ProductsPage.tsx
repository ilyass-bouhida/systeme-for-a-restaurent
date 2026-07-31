import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "@/features/admin/components/ProductForm";
import {
  useAdminCategories,
  useAdminProducts,
  useCreateCategory,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useUpdateCategory,
  useUpdateProduct,
} from "@/features/admin/admin-queries";
import type { Product } from "@/types/api";
import { formatMoney } from "@/utils/money";
import { ImageOff, Pencil, Plus, Power, Tags, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

export function ProductsPage() {
  const categories = useAdminCategories();
  const products = useAdminProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [categoryName, setCategoryName] = useState("");
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (categories.isLoading || products.isLoading) {
    return <LoadingScreen label="Loading the menu…" />;
  }

  const submitCategory = (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    createCategory.mutate(
      { name: categoryName.trim() },
      { onSuccess: () => setCategoryName("") },
    );
  };

  const closeProductModal = () => {
    setProductModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="amber">Menu management</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
            Products & categories
          </h1>
          <p className="mt-2 text-stone-500">
            Keep the cashier menu focused and up to date.
          </p>
        </div>
        <Button
          size="lg"
          icon={<Plus className="size-5" />}
          onClick={() => setProductModal(true)}
          disabled={(categories.data?.length ?? 0) === 0}
        >
          Add product
        </Button>
      </div>

      <Card className="mt-7 p-5">
        <div className="flex items-center gap-2">
          <Tags className="size-5 text-stone-500" />
          <h2 className="text-lg font-black">Categories</h2>
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={submitCategory}
        >
          <Input
            className="sm:min-w-72"
            placeholder="New category name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
          />
          <Button type="submit" disabled={createCategory.isPending}>
            Add category
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.data?.map((category) => (
            <div
              key={category.id}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3"
            >
              <span className="text-sm font-bold">{category.name}</span>
              <button
                className={
                  category.is_active ? "text-emerald-600" : "text-stone-400"
                }
                aria-label={`Toggle ${category.name}`}
                onClick={() =>
                  updateCategory.mutate({
                    id: category.id,
                    input: { is_active: !category.is_active },
                  })
                }
              >
                <Power className="size-4" />
              </button>
              <button
                className="text-stone-400 hover:text-red-600"
                aria-label={`Delete ${category.name}`}
                onClick={() => {
                  if (window.confirm(`Delete category “${category.name}”?`)) {
                    deleteCategory.mutate(category.id);
                  }
                }}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {products.data?.data.map((product) => (
          <article
            key={product.id}
            className="flex min-h-36 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="w-32 shrink-0 bg-stone-100 sm:w-40">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-stone-400">
                  <ImageOff className="size-6" />
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-black">{product.name}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">
                    {product.category_name}
                  </p>
                </div>
                <Badge tone={product.is_active ? "green" : "neutral"}>
                  {product.is_active ? "Active" : "Hidden"}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">
                    Sell
                  </p>
                  <strong className="text-sm">
                    {formatMoney(product.price_cents)}
                  </strong>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">
                    Cost
                  </p>
                  <strong className="text-sm">
                    {formatMoney(product.cost_cents ?? 0)}
                  </strong>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">
                    Profit
                  </p>
                  <strong className="text-sm text-emerald-700">
                    {formatMoney(
                      product.price_cents - (product.cost_cents ?? 0),
                    )}
                  </strong>
                </div>
              </div>
              <div className="mt-auto flex gap-2 pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Pencil className="size-4" />}
                  onClick={() => {
                    setEditingProduct(product);
                    setProductModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Power className="size-4" />}
                  onClick={() =>
                    updateProduct.mutate({
                      id: product.id,
                      input: { is_active: !product.is_active },
                    })
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => {
                    if (window.confirm(`Delete “${product.name}”?`)) {
                      deleteProduct.mutate(product.id);
                    }
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {products.data?.data.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon={<Tags className="size-6" />}
            title="No products yet"
            description="Create a category, then add the first dish or drink."
          />
        </div>
      )}

      <Modal
        open={productModal}
        onClose={closeProductModal}
        title={editingProduct ? "Edit product" : "Add product"}
      >
        <ProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          categories={categories.data ?? []}
          busy={createProduct.isPending || updateProduct.isPending}
          onSubmit={(input) => {
            if (editingProduct) {
              updateProduct.mutate(
                { id: editingProduct.id, input },
                { onSuccess: closeProductModal },
              );
            } else {
              createProduct.mutate(input, { onSuccess: closeProductModal });
            }
          }}
        />
      </Modal>
    </div>
  );
}
