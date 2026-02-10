import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "./App.css";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  discountPercentage: number;
};

type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const globalSearch: FilterFn<Product> = (row, _columnId, filterValue) => {
  const search = String(filterValue ?? "")
    .trim()
    .toLowerCase();
  if (!search) return true;
  const { title, brand, category, description } = row.original;
  return [title, brand, category, description].some((value) =>
    value?.toLowerCase().includes(search),
  );
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const response = await fetch(
          "https://dummyjson.com/products?limit=50",
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as ProductsResponse;
        setProducts(data.products ?? []);
        setStatus("success");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load products.",
        );
      }
    };

    void loadProducts();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [globalFilter, columnFilters, products]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Product",
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.thumbnail}
              alt={row.original.title}
              className="h-10 w-10 rounded object-cover"
              loading="lazy"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium">{getValue<string>()}</div>
              <div className="text-xs text-slate-500">
                {row.original.description}
              </div>
            </div>
          </div>
        ),
        enableGlobalFilter: true,
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        filterFn: "equalsString",
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue }) => (
          <span className="text-sm">
            {priceFormatter.format(getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue<number>().toFixed(1)}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ getValue }) => (
          <span className="text-sm">{getValue<number>()}</span>
        ),
      },
    ],
    [],
  );

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.category));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    globalFilterFn: globalSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const currentCategory =
    (table.getColumn("category")?.getFilterValue() as string | undefined) ??
    "all";
  const filteredCount = table.getFilteredRowModel().rows.length;
  const totalCount = products.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex;

  const handleReset = () => {
    setGlobalFilter("");
    setSorting([]);
    setColumnFilters([]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-slate-600">
            Search across titles, brands, categories, and descriptions. Click a
            column header to sort.
          </p>
        </header>

        <section className="mb-6 space-y-4 rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-1 min-w-55 flex-col gap-1 text-sm text-slate-600">
              Search
              <input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder="Search products..."
                className="h-9 rounded border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-slate-500"
              />
            </label>

            <label className="flex min-w-45 flex-col gap-1 text-sm text-slate-600">
              Category
              <select
                value={currentCategory}
                onChange={(event) => {
                  const value = event.target.value;
                  table
                    .getColumn("category")
                    ?.setFilterValue(value === "all" ? undefined : value);
                }}
                className="h-9 rounded border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-slate-500"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <button
                type="button"
                onClick={handleReset}
                className="h-9 rounded border border-slate-300 px-3 text-sm text-slate-700"
              >
                Reset
              </button>
              <span>
                {filteredCount} of {totalCount} products
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200">
          {status === "loading" && (
            <div className="p-4 text-sm text-slate-500">
              Loading products...
            </div>
          )}
          {status === "error" && (
            <div className="p-4 text-sm text-rose-600">
              {errorMessage ?? "Unable to load products."}
            </div>
          )}

          {status === "success" && (
            <div className="overflow-x-auto">
              <table className="min-w-225 w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sortState = header.column.getIsSorted();
                        return (
                          <th
                            key={header.id}
                            className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {header.isPlaceholder ? null : canSort ? (
                              <button
                                className="flex items-center gap-2 text-left"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                {sortState && (
                                  <span className="text-[10px] text-slate-400">
                                    {sortState === "asc" ? "asc" : "desc"}
                                  </span>
                                )}
                              </button>
                            ) : (
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-3 align-top">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {table.getRowModel().rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={table.getAllLeafColumns().length}
                        className="px-3 py-6 text-center text-sm text-slate-500"
                      >
                        No products match those filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {status === "success" && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 rounded border border-slate-300 px-3 text-sm text-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 rounded border border-slate-300 px-3 text-sm text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
              <span>
                Page {pageIndex + 1} of {pageCount}
              </span>
            </div>

            <label className="flex items-center gap-2">
              Rows per page
              <select
                value={table.getState().pagination.pageSize}
                onChange={(event) =>
                  table.setPageSize(Number(event.target.value))
                }
                className="h-9 rounded border border-slate-300 px-2 text-sm text-slate-700"
              >
                {[5, 10].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
