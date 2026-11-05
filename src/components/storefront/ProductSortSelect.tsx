"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ProductSortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 font-semibold cursor-pointer shadow-2xs"
    >
      <option value="featured">Featured First</option>
      <option value="newest">Newest Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}

