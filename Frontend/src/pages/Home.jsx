import { useState, useMemo } from "react";

import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

import {
  Search,
  Package,
  Store,
  BadgePercent,
  SlidersHorizontal,
  SearchX,
  Gift,
  Wallet,
  ShoppingBag,
} from "lucide-react";

const CATEGORIES = ["All", "Electronics", "Fashion", "Food & Beverages", "Sports & Fitness", "Art & Crafts"];

export default function Home() {
  const { products } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "discount":
        list.sort((a, b) => {
          const da = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0;
          const db = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0;
          return db - da;
        });
        break;
      default: break;
    }
    return list;
  }, [products, search, category, sort]);

  return (
    <div className="home-page">
      {/* Hero Section */}
<section className="bg-gradient-to-br from-green-50 via-white to-green-100">
  <div className="mx-auto max-w-7xl px-6 py-20 lg:flex lg:items-center lg:justify-between">

    {/* Left */}
    <div className="max-w-2xl">

      <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
        🇳🇵 Nepal's Premier Marketplace
      </span>

      <h1 className="mt-6 text-5xl font-extrabold leading-tight text-gray-900">
        Discover{" "}
        <span className="text-green-600">
          Authentic
        </span>{" "}
        Nepali Products
      </h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Shop handcrafted treasures, local foods, fashion and electronics
        directly from trusted Nepali sellers.
      </p>

      {/* Search */}

      <div className="relative mt-10">

        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        />

      </div>

      {/* Stats */}

      <div className="mt-12 flex flex-wrap gap-8">

        <div className="flex items-center gap-3">

          <Package className="text-green-600" />

          <div>
            <h3 className="text-2xl font-bold">
              {products.length}+
            </h3>

            <p className="text-sm text-gray-500">
              Products
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          <Store className="text-green-600" />

          <div>
            <h3 className="text-2xl font-bold">
              2
            </h3>

            <p className="text-sm text-gray-500">
              Trusted Sellers
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          <BadgePercent className="text-green-600" />

          <div>
            <h3 className="text-2xl font-bold">
              3
            </h3>

            <p className="text-sm text-gray-500">
              Active Promotions
            </p>
          </div>

        </div>

      </div>

    </div>

    {/* Right */}

    <div className="mt-16 flex justify-center lg:mt-0">

      <div className="relative h-[420px] w-[420px]">

        {/* Main Circle */}

        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-green-700 opacity-10 blur-3xl" />

        {/* Card 1 */}

        <div className="absolute left-0 top-10 flex w-60 items-center gap-4 rounded-2xl bg-white p-5 shadow-xl">

          <div className="text-4xl">
            🎧
          </div>

          <div>
            <p className="font-semibold">
              Wireless Headphones
            </p>

            <p className="text-green-600 font-bold">
              Rs. 4,999
            </p>
          </div>

        </div>

        {/* Card 2 */}

        <div className="absolute right-0 top-44 flex w-60 items-center gap-4 rounded-2xl bg-white p-5 shadow-xl">

          <div className="text-4xl">
            🍯
          </div>

          <div>
            <p className="font-semibold">
              Himalayan Honey
            </p>

            <p className="text-green-600 font-bold">
              Rs. 850
            </p>
          </div>

        </div>

        {/* Card 3 */}

        <div className="absolute bottom-10 left-16 flex w-60 items-center gap-4 rounded-2xl bg-white p-5 shadow-xl">

          <div className="text-4xl">
            🏷️
          </div>

          <div>
            <p className="font-semibold">
              WELCOME15
            </p>

            <p className="text-green-600 font-bold">
              15% OFF
            </p>
          </div>

        </div>

      </div>

    </div>

  </div>
</section>
{/* Categories */}
<section className="bg-white py-8">
  <div className="mx-auto max-w-7xl px-6">

    <div className="flex flex-wrap justify-center gap-3">

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200
            ${
              category === cat
                ? "bg-green-600 text-white shadow-md"
                : "border border-gray-300 bg-white text-gray-700 hover:border-green-500 hover:text-green-600"
            }`}
        >
          {cat}
        </button>
      ))}

    </div>

  </div>
</section>

{/* Products */}
<section className="bg-gray-50 py-14">
  <div className="mx-auto max-w-7xl px-6">

    {/* Header */}

    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

      <div>

        <h2 className="text-3xl font-bold text-gray-900">
          {category === "All" ? "All Products" : category}
        </h2>

        <p className="mt-1 text-gray-500">
          {filtered.length} products available
        </p>

      </div>

      {/* Sort */}

      <div className="relative w-full md:w-64">

        <SlidersHorizontal
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="discount">Biggest Discount</option>
        </select>

      </div>

    </div>

    {/* Products */}

    {filtered.length === 0 ? (

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center shadow-sm">

        <SearchX
          size={60}
          className="mx-auto text-gray-400"
        />

        <h3 className="mt-5 text-2xl font-semibold text-gray-800">
          No products found
        </h3>

        <p className="mt-2 text-gray-500">
          Try adjusting your search or category filters.
        </p>

        <button
          onClick={() => {
            setSearch("");
            setCategory("All");
          }}
          className="mt-8 rounded-xl bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
        >
          Clear Filters
        </button>

      </div>

    ) : (

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}

      </div>

    )}

  </div>
</section>
{/* Promo Banner */}
<section className="bg-green-600 py-16">
  <div className="mx-auto max-w-7xl px-6">

    <div className="grid gap-6 md:grid-cols-3">

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
          <Gift className="text-green-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          TECH20
        </h3>

        <p className="mt-2 text-gray-600">
          20% OFF Electronics
        </p>

        <span className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          Min. Rs. 1,000
        </span>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
          <Wallet className="text-green-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          NEPAL500
        </h3>

        <p className="mt-2 text-gray-600">
          Flat Rs. 500 Discount
        </p>

        <span className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          Min. Rs. 2,000
        </span>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
          <BadgePercent className="text-green-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          WELCOME15
        </h3>

        <p className="mt-2 text-gray-600">
          15% OFF for New Customers
        </p>

        <span className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          Min. Rs. 500
        </span>
      </div>

    </div>

  </div>
</section>
<footer className="bg-gray-900 text-gray-300">

  <div className="mx-auto max-w-7xl px-6 py-14">

    <div className="grid gap-10 md:grid-cols-3">

      {/* Brand */}

      <div>

        <div className="mb-4 flex items-center gap-3">

          <div className="rounded-xl bg-green-600 p-3">
            <ShoppingBag className="text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white">
            BazaarNepal
          </h2>

        </div>

        <p className="leading-7 text-gray-400">
          Nepal's trusted marketplace connecting local sellers
          with customers across the country.
        </p>

      </div>

      {/* Links */}

      <div>

        <h3 className="mb-5 text-lg font-semibold text-white">
          Quick Links
        </h3>

        <div className="space-y-3">

          <a
            href="/"
            className="block transition hover:text-green-400"
          >
            Home
          </a>

          <a
            href="/login"
            className="block transition hover:text-green-400"
          >
            Login
          </a>

          <a
            href="/signup"
            className="block transition hover:text-green-400"
          >
            Sign Up
          </a>

        </div>

      </div>

      {/* Payment */}

      <div>

        <h3 className="mb-5 text-lg font-semibold text-white">
          Payment Method
        </h3>

        <div className="inline-flex rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow">
          eSewa
        </div>

      </div>

    </div>

    <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">

      © 2025 BazaarNepal · Created by{" "}

      <a
        href="https://dikeshsapkota.com.np"
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-green-400 hover:text-green-300"
      >
        Dikesh Sapkota
      </a>

    </div>

  </div>

</footer>
</div>
  );
}