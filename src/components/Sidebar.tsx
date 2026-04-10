"use client";
import { useEffect, useState, useMemo } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useSettings } from "@/context/SettingsContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (cat: string) => void;
  selectedColors?: string[];
  onColorsChange?: (colors: string[]) => void;
  priceRange?: [number, number];
  onPriceRangeChange?: (range: [number, number]) => void;
  allProducts?: { color?: string; price?: string }[];
}

export default function Sidebar({
  isOpen,
  onClose,
  selectedCategory = "All Products",
  onCategoryChange,
  selectedColors = [],
  onColorsChange,
  priceRange,
  onPriceRangeChange,
  allProducts = [],
}: SidebarProps) {
  const { categories, fetchCategories } = useCategoryStore();
  const { settings } = useSettings();
  const currency = settings?.currency_symbol || "$";

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Derive unique colors from all products
  const uniqueColors = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.color && p.color.trim()) set.add(p.color.trim().toLowerCase());
    });
    return Array.from(set);
  }, [allProducts]);

  // Derive min/max prices from all products
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = allProducts
      .map((p) => parseFloat(p.price || "0"))
      .filter((n) => !isNaN(n) && n > 0);
    if (prices.length === 0) return { minPrice: 0, maxPrice: 1000 };
    return { minPrice: Math.floor(Math.min(...prices)), maxPrice: Math.ceil(Math.max(...prices)) };
  }, [allProducts]);

  const [localMax, setLocalMax] = useState<number | null>(null);
  const effectiveMax = localMax ?? maxPrice;

  // Reset local slider when product prices change
  useEffect(() => {
    setLocalMax(null);
    onPriceRangeChange?.([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    onColorsChange?.(next);
  };

  const handleSelect = (cat: string) => {
    onCategoryChange?.(cat);
    onClose?.();
  };

  const displayCategories = [
    "All Products",
    ...categories.filter((c) => c.name !== "All Products").map((c) => c.name),
  ];

  const sidebarContent = (
    <div>
      {/* Categories */}
      <div className="mb-10">
        <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-gray-900 dark:text-gray-100">Categories</h3>
        <ul className="space-y-4">
          {displayCategories.map((c) => (
            <li key={c}>
              <button
                onClick={() => handleSelect(c)}
                className={`text-sm tracking-wide hover:text-black dark:hover:text-white transition-colors cursor-pointer ${
                  selectedCategory === c
                    ? "text-black dark:text-white font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Colors */}
      {uniqueColors.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm tracking-widest uppercase text-gray-900 dark:text-gray-100">Colors</h3>
            {selectedColors.length > 0 && (
              <button
                onClick={() => onColorsChange?.([])}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {uniqueColors.map((c) => {
              const isSelected = selectedColors.includes(c);
              const isLight = c === "#ffffff" || c === "white" || c === "#fff";
              return (
                <button
                  key={c}
                  onClick={() => toggleColor(c)}
                  title={c}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                    isLight ? "border border-gray-300 dark:border-neutral-600" : "border border-transparent"
                  } ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-neutral-900 scale-110"
                      : "ring-2 ring-offset-2 ring-transparent hover:ring-gray-300 dark:hover:ring-neutral-600 dark:ring-offset-neutral-900"
                  }`}
                  style={{ backgroundColor: c }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-sm tracking-widest uppercase text-gray-900 dark:text-gray-100">Price Range</h3>
          {localMax !== null && localMax !== maxPrice && (
            <button
              onClick={() => { setLocalMax(null); onPriceRangeChange?.([minPrice, maxPrice]); }}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="w-full">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={effectiveMax}
            onChange={(e) => {
              const val = Number(e.target.value);
              setLocalMax(val);
              onPriceRangeChange?.([minPrice, val]);
            }}
            className="w-full h-1 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">
            <span>{currency}{minPrice.toLocaleString()}</span>
            <span>{currency}{effectiveMax.toLocaleString()}{effectiveMax === maxPrice ? "+" : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-72 flex-shrink-0 sticky top-24 h-fit hidden lg:block transition-colors duration-300">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-900 shadow-2xl p-8 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black uppercase tracking-widest text-sm text-gray-900 dark:text-gray-100">Filter</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-600 dark:text-gray-400 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
