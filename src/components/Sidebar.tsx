"use client";
import { useEffect, useState } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (cat: string) => void;
}

export default function Sidebar({ isOpen, onClose, selectedCategory = "All Products", onCategoryChange }: SidebarProps) {
  const { categories, fetchCategories } = useCategoryStore();
  const colors = ["#000000", "#ffffff", "#8B4513", "#808080", "#000080", "#556B2F"];

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Compose display list: "All Products" first, then DB categories (excluding "All Products" if present)
  const displayCategories = [
    "All Products",
    ...categories.filter((c) => c.name !== "All Products").map((c) => c.name),
  ];

  const handleSelect = (cat: string) => {
    onCategoryChange?.(cat);
    onClose?.();
  };

  const sidebarContent = (
    <div className="h-full overflow-y-auto px-1">
      <div className="mb-10">
        <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-gray-900 dark:text-gray-100">Categories</h3>
        <ul className="space-y-4">
          {displayCategories.map((c) => (
            <li key={c}>
              <button
                onClick={() => handleSelect(c)}
                className={`text-sm tracking-wide hover:text-black dark:hover:text-white transition-colors ${
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

      <div className="mb-10">
        <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-gray-900 dark:text-gray-100">Colors</h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((c, i) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border ${
                c === "#ffffff" ? "border-gray-300 dark:border-neutral-700" : "border-transparent"
              } ring-2 ring-offset-2 dark:ring-offset-neutral-900 ${
                i === 0
                  ? "ring-black dark:ring-white"
                  : "ring-transparent hover:ring-gray-300 dark:hover:ring-neutral-700"
              } transition-all`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-gray-900 dark:text-gray-100">Price Range</h3>
        <div className="w-full">
          <input
            type="range"
            min="0"
            max="1000"
            defaultValue="500"
            className="w-full h-1 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">
            <span>$0</span>
            <span>$1,000+</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 pr-10 flex-shrink-0 sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto hidden lg:block transition-colors duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-900 shadow-2xl p-8 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black uppercase tracking-widest text-sm text-gray-900 dark:text-gray-100">Filter</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-gray-600 dark:text-gray-400"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
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
