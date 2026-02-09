import "./App.css";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
  type Product,
  type ProductForm,
} from "./lib/productsApi";

type AvailabilityLevel = "in-stock" | "low-stock" | "out-of-stock";

const emptyForm: ProductForm = {
  title: "",
  category: "",
  description: "",
  price: 0,
  stock: 0,
};

const availabilityStyles: Record<AvailabilityLevel, string> = {
  "in-stock": "status-pill status-ok",
  "low-stock": "status-pill status-warn",
  "out-of-stock": "status-pill status-bad",
};

const availabilityLabels: Record<AvailabilityLevel, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

function normalizeForm(form: ProductForm) {
  return {
    ...form,
    title: form.title.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
  };
}

function normalizeAvailability(
  value?: string | null,
): AvailabilityLevel | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes("out")) {
    return "out-of-stock";
  }

  if (normalized.includes("low")) {
    return "low-stock";
  }

  if (normalized.includes("in")) {
    return "in-stock";
  }

  return null;
}

function getAvailability(product: Product): AvailabilityLevel {
  const fromApi = normalizeAvailability(product.availabilityStatus);

  if (fromApi) {
    return fromApi;
  }

  if (product.stock <= 0) {
    return "out-of-stock";
  }

  if (product.stock <= 6) {
    return "low-stock";
  }

  return "in-stock";
}

function toProductForm(product: Product): ProductForm {
  return {
    title: product.title,
    category: product.category,
    description: product.description,
    price: product.price,
    stock: product.stock,
  };
}

function App() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>(emptyForm);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<{
    id: number;
    message: string;
  } | null>(null);

  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(15),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (created) => {
      queryClient.setQueryData<Product[]>(["products"], (prev = []) => [
        created,
        ...prev,
      ]);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: ProductForm }) =>
      updateProduct(id, updates),
    onMutate: ({ id }) => {
      setSavingId(id);
    },
    onSettled: () => {
      setSavingId(null);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Product[]>(["products"], (prev = []) =>
        prev.map((product) =>
          product.id === updated.id ? { ...product, ...updated } : product,
        ),
      );
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => deleteProduct(id),
    onMutate: ({ id }) => {
      setDeletingId(id);
      setDeleteError(null);
    },
    onError: (mutationError, variables) => {
      setDeleteError({
        id: variables.id,
        message:
          mutationError instanceof Error
            ? mutationError.message
            : "Unable to delete product.",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
    onSuccess: ({ id }) => {
      queryClient.setQueryData<Product[]>(["products"], (prev = []) =>
        prev.filter((product) => product.id !== id),
      );
    },
  });

  const submitCreate = () => {
    createMutation.mutate(normalizeForm(form));
  };

  const handleEditStart = (product: Product) => {
    setEditingId(product.id);
    setEditForm(toProductForm(product));
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const submitEdit = () => {
    if (editingId === null) {
      return;
    }

    updateMutation.mutate({ id: editingId, updates: normalizeForm(editForm) });
  };

  const handleDelete = (product: Product) => {
    if (deleteMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${product.title}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate({ id: product.id });
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <h1>Products</h1>
          <p className="muted">Basic CRUD using DummyJSON + TanStack Query.</p>
        </div>
      </header>

      <main className="main-grid">
        <section className="panel">
          <h2>Create Product</h2>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              submitCreate();
            }}
          >
            <label className="field-label">
              Product name
              <input
                className="field"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Minimalist Backpack"
                required
              />
            </label>

            <label className="field-label">
              Category
              <input
                className="field"
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="bags"
                required
              />
            </label>

            <div className="two-col">
              <label className="field-label">
                Price
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      price: Number(event.target.value),
                    }))
                  }
                  required
                />
              </label>
              <label className="field-label">
                Stock
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      stock: Number(event.target.value),
                    }))
                  }
                  required
                />
              </label>
            </div>

            <label className="field-label">
              Description
              <textarea
                className="field"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            {createMutation.isError ? (
              <div className="error-box" role="alert">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Unable to create product."}
              </div>
            ) : null}

            <div className="actions">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving
                  </span>
                ) : (
                  "Add Product"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setForm(emptyForm)}
              >
                Reset
              </Button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="section-head">
            <h2>Inventory</h2>
            <span className="muted text-sm">
              {isLoading ? "Loading..." : `${products.length} products`}
            </span>
          </div>

          <div className="stack">
            {isLoading ? (
              <div className="stack">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="skeleton" />
                ))}
              </div>
            ) : isError ? (
              <div className="error-box" role="alert">
                {error instanceof Error
                  ? error.message
                  : "We hit a snag fetching your products."}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">No products yet.</div>
            ) : (
              products.map((product) => {
                const isEditing = editingId === product.id;
                const isSaving = savingId === product.id;
                const isDeleting = deletingId === product.id;
                const availability = getAvailability(product);
                const availabilityLabel =
                  product.availabilityStatus ??
                  availabilityLabels[availability];
                const deleteMessage =
                  deleteError?.id === product.id ? deleteError.message : null;

                return (
                  <Card key={product.id}>
                    <CardHeader className="product-top">
                      <div>
                        <CardTitle>{product.title}</CardTitle>
                        <p className="muted">{product.description}</p>
                        <div className="meta-row">
                          <span className="chip">{product.category}</span>
                          <span className={availabilityStyles[availability]}>
                            {availabilityLabel}
                          </span>
                        </div>
                      </div>
                      <div className="product-price">
                        <div className="price">${product.price}</div>
                        <div className="muted text-xs">
                          {product.stock} in stock
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="actions">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditStart(product)}
                          disabled={isDeleting}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Deleting
                            </span>
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </div>

                      {deleteMessage ? (
                        <div className="error-box" role="alert">
                          {deleteMessage}
                        </div>
                      ) : null}

                      {isEditing ? (
                      <form
                        className="stack"
                        onSubmit={(event) => {
                          event.preventDefault();
                          submitEdit();
                        }}
                      >
                          <div className="two-col">
                            <label className="field-label">
                              Name
                              <input
                                className="field"
                                value={editForm.title}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    title: event.target.value,
                                  }))
                                }
                                required
                              />
                            </label>
                            <label className="field-label">
                              Category
                              <input
                                className="field"
                                value={editForm.category}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    category: event.target.value,
                                  }))
                                }
                                required
                              />
                            </label>
                          </div>

                          <div className="two-col">
                            <label className="field-label">
                              Price
                              <input
                                className="field"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.price}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    price: Number(event.target.value),
                                  }))
                                }
                                required
                              />
                            </label>
                            <label className="field-label">
                              Stock
                              <input
                                className="field"
                                type="number"
                                min="0"
                                step="1"
                                value={editForm.stock}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    stock: Number(event.target.value),
                                  }))
                                }
                                required
                              />
                            </label>
                          </div>

                          <label className="field-label">
                            Description
                            <textarea
                              className="field"
                              value={editForm.description}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  description: event.target.value,
                                }))
                              }
                            />
                          </label>

                          {updateMutation.isError && editingId === product.id ? (
                            <div className="error-box" role="alert">
                              {updateMutation.error instanceof Error
                                ? updateMutation.error.message
                                : "Unable to update product."}
                            </div>
                          ) : null}

                          <div className="actions">
                            <Button type="submit" disabled={isSaving}>
                              {isSaving ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                  Updating
                                </span>
                              ) : (
                                "Save changes"
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
