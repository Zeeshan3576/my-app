import { useEffect, useMemo, useState } from 'react'
import {
  addItem,
  clearCart,
  decrement,
  increment,
  removeItem,
  selectCartCount,
  selectCartItems,
  selectCartTotal,
} from '../../store/cartSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useUiStore } from '../../store/uiStore'

type Product = {
  id: number
  title: string
  description: string
  price: number
  category: string
  rating: number
  stock: number
  thumbnail?: string
}

type ProductsResponse = {
  products: Product[]
}

const Cart = () => {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector(selectCartItems)
  const cartCount = useAppSelector(selectCartCount)
  const cartTotal = useAppSelector(selectCartTotal)

  const {
    isCartOpen,
    closeCart,
    toggleCart,
    search,
    setSearch,
    sort,
    setSort,
    view,
    setView,
  } = useUiStore()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('https://dummyjson.com/products?limit=50', {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`Request failed with ${res.status}`)
        }
        const data = (await res.json()) as ProductsResponse
        setProducts(data.products ?? [])
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [])

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    let next = term
      ? products.filter(
          (product) =>
            product.title.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term),
        )
      : products

    switch (sort) {
      case 'price-asc':
        next = [...next].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        next = [...next].sort((a, b) => b.price - a.price)
        break
      case 'title-asc':
        next = [...next].sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        next = [...next]
    }

    return next
  }, [products, search, sort])

  const viewClass =
    view === 'grid'
      ? 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
      : 'flex flex-col gap-4'

  const cardClass =
    view === 'grid'
      ? 'card flex flex-col gap-4'
      : 'card flex flex-col gap-4 sm:flex-row sm:items-center'

  return (
    <div className="app-shell">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-10">
        <header className="flex flex-col gap-6 rounded-2xl border border-black/5 bg-white/70 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                DummyJSON Market
              </p>
              <h1 className="hero-title mt-2 text-3xl font-semibold text-slate-900 md:text-4xl">
                Cart Application
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Browse products, tweak your view, and manage the cart instantly.
              </p>
            </div>
            <button
              className="cart-pill"
              onClick={toggleCart}
              aria-label="Toggle cart drawer"
            >
              Cart
              <span className="cart-count">{cartCount}</span>
              <span className="text-slate-500">${cartTotal.toFixed(2)}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm shadow-sm">
              <span className="text-slate-400">Search</span>
              <input
                className="w-full bg-transparent text-slate-700 outline-none"
                placeholder="Type a product or category"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as typeof sort)
              }
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white p-1 text-sm shadow-sm">
              <button
                className={`view-toggle ${view === 'grid' ? 'active' : ''}`}
                onClick={() => setView('grid')}
              >
                Grid
              </button>
              <button
                className={`view-toggle ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
              >
                List
              </button>
            </div>
          </div>
        </header>

        <main className="mt-10 flex-1">
          {loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500">
              Loading products...
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          )}
          {!loading && !error && (
            <section className={viewClass}>
              {visibleProducts.map((product, index) => {
                const inCart = cartItems.find(
                  (item) => item.id === product.id,
                )
                return (
                  <article
                    key={product.id}
                    className={`${cardClass} fade-up`}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <div className="relative overflow-hidden rounded-xl border border-black/5 bg-slate-100">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className={`h-40 w-full object-cover ${
                            view === 'list' ? 'sm:h-28 sm:w-28' : ''
                          }`}
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {product.category}
                          </p>
                          <h2 className="text-lg font-semibold text-slate-900">
                            {product.title}
                          </h2>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                          ${product.price}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Rating {product.rating.toFixed(1)}</span>
                        <span>Stock {product.stock}</span>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        {!inCart ? (
                          <button
                            className="primary-button"
                            onClick={() =>
                              dispatch(
                                addItem({
                                  id: product.id,
                                  title: product.title,
                                  price: product.price,
                                  thumbnail: product.thumbnail,
                                }),
                              )
                            }
                          >
                            Add to cart
                          </button>
                        ) : (
                          <div className="quantity-control">
                            <button
                              onClick={() => dispatch(decrement(product.id))}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span>{inCart.quantity}</span>
                            <button
                              onClick={() => dispatch(increment(product.id))}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        )}
                        {inCart && (
                          <button
                            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600"
                            onClick={() => dispatch(removeItem(product.id))}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          )}
        </main>
      </div>

      <div
        className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      />
      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button
            className="text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600"
            onClick={closeCart}
          >
            Close
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {cartItems.length === 0
            ? 'Cart is empty.'
            : `You have ${cartCount} item${cartCount === 1 ? '' : 's'} in cart.`}
        </p>

        <div className="mt-6 flex flex-1 flex-col gap-4 overflow-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-line">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500">
                  ${item.price} each
                </p>
              </div>
              <div className="quantity-control compact">
                <button onClick={() => dispatch(decrement(item.id))}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => dispatch(increment(item.id))}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              className="primary-button flex-1"
              disabled={cartItems.length === 0}
            >
              Checkout
            </button>
            <button
              className="secondary-button"
              onClick={() => dispatch(clearCart())}
              disabled={cartItems.length === 0}
            >
              Clear
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Cart
