export type ProductForm = {
  title: string;
  category: string;
  description: string;
  price: number;
  stock: number;
};

export type Product = ProductForm & {
  id: number;
  brand?: string;
  rating?: number;
  thumbnail?: string;
  availabilityStatus?: string;
};

type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

type DeleteResult = { id: number };

type ApiError = { message?: string };

const API_BASE = "https://dummyjson.com";

async function request<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);

  if (!response.ok) {
    let message = response.statusText;

    try {
      const data = (await response.json()) as ApiError;
      if (data?.message) {
        message = data.message;
      }
    } catch (error) {
      console.log(error);
    }

    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
}

function validateProduct(input: ProductForm) {
  if (!input.title.trim()) {
    throw new Error("Product name is required.");
  }

  if (!input.category.trim()) {
    throw new Error("Category is required.");
  }

  if (input.price < 0) {
    throw new Error("Price must be a positive number.");
  }

  if (input.stock < 0) {
    throw new Error("Stock must be a positive number.");
  }
}

export async function fetchProducts(limit = 25) {
  const data = await request<ProductsResponse>(
    `${API_BASE}/products?limit=${limit}`,
  );
  return data.products;
}

export async function createProduct(input: ProductForm) {
  validateProduct(input);

  return request<Product>(`${API_BASE}/products/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function updateProduct(id: number, updates: ProductForm) {
  validateProduct(updates);

  return request<Product>(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
}

export async function deleteProduct(id: number): Promise<DeleteResult> {
  const result = await request<{ id: number }>(`${API_BASE}/products/${id}`, {
    method: "DELETE",
  });

  return { id: result.id };
}
