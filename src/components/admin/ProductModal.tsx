"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Product } from "@/store/useProductStore";
import { Category } from "@/store/useCategoryStore";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  newProduct: {
    name: string;
    category: string;
    price: string;
    cost_price: string;
    color: string;
    quantity: string;
    description?: string;
  };
  setNewProduct: (product: any) => void;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  onPurchase?: (quantity: number, cost: number) => Promise<void>;
  submitting?: boolean;
}

function CategoryDropdown({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: Category[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-left flex items-center justify-between text-sm"
      >
        <span className={value ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
          {value || "Select category"}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5"
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 italic">No categories available</p>
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onChange(cat.name); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-between ${
                  value === cat.name ? "font-bold text-black dark:text-white bg-gray-50 dark:bg-neutral-700" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {cat.name}
                {value === cat.name && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

export default function ProductModal({
  isOpen,
  onClose,
  editingProduct,
  newProduct,
  setNewProduct,
  categories,
  onSubmit,
  handleImageChange,
  imagePreview,
  onPurchase,
  submitting = false,
}: ProductModalProps) {
  const [purchaseError, setPurchaseError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePurchaseClick = async () => {
    if (submitting) return;
    setPurchaseError("");
    const qty = parseInt(newProduct.quantity);
    const cost = parseFloat(newProduct.cost_price);

    if (!qty || qty <= 0) {
      setPurchaseError("Please enter a valid stock quantity (must be greater than 0).");
      return;
    }
    if (!cost || cost < 0) {
      setPurchaseError("Please enter a valid cost price.");
      return;
    }

    await onPurchase!(qty, cost);
  };

  const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  const labelCls = "text-sm font-bold text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black dark:hover:text-white p-1 transition-colors cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1">
          {/* Product Name */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Product Name</label>
            <input
              required
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="e.g. Minimalist Linen Shirt"
              className={inputCls}
            />
          </div>

          {/* Category + Cost Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Category</label>
              <CategoryDropdown
                value={newProduct.category}
                categories={categories}
                onChange={(val) => setNewProduct({ ...newProduct, category: val })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Cost Price</label>
              <input
                required
                type="number"
                min="0"
                value={newProduct.cost_price}
                onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                placeholder="70.00"
                className={inputCls}
              />
            </div>
          </div>

          {/* Selling Price + Stock Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Selling Price</label>
              <input
                required
                type="number"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="99.00"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>
                Stock Qty
                <span className="ml-1 text-[10px] font-normal text-gray-400">(Purchase only)</span>
              </label>
              <input
                type="number"
                min="0"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>

          {/* Color + Image upload side by side */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Color &amp; Image</label>
            <div className="flex items-center gap-3">
              {/* Color picker */}
              <input
                type="color"
                value={newProduct.color}
                onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                className="w-12 h-12 rounded-xl border border-gray-200 dark:border-neutral-700 cursor-pointer overflow-hidden p-0 flex-shrink-0"
                title="Pick color"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase w-20">{newProduct.color}</span>

              {/* Image upload button — same size as color box */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="product-image"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all cursor-pointer overflow-hidden flex-shrink-0 relative"
                title="Upload product image"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="text-gray-400 dark:text-gray-500 absolute inset-0 m-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </button>
              {imagePreview && (
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[80px]">Image set</span>
              )}
            </div>
          </div>

          {/* Description — rich text editor */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Description</label>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:dark:bg-neutral-800 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:dark:border-neutral-700 [&_.ql-container]:bg-white [&_.ql-container]:dark:bg-neutral-900 [&_.ql-editor]:text-gray-900 [&_.ql-editor]:dark:text-gray-100 [&_.ql-editor]:min-h-[120px] [&_.ql-toolbar_button]:text-gray-600 [&_.ql-toolbar_button]:dark:text-gray-400 [&_.ql-picker-label]:text-gray-600 [&_.ql-picker-label]:dark:text-gray-400 [&_.ql-stroke]:stroke-current [&_.ql-fill]:fill-current [&_.ql-container]:border-0 [&_.ql-toolbar]:rounded-t-none">
              <ReactQuill
                value={newProduct.description || ""}
                onChange={(val) => setNewProduct({ ...newProduct, description: val })}
                modules={quillModules}
                placeholder="Write a product description..."
                theme="snow"
              />
            </div>
          </div>

          {/* Purchase error */}
          {purchaseError && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl">{purchaseError}</p>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col-reverse md:flex-row gap-3 border-t border-gray-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <div className="flex-1 flex gap-3">
              {onPurchase && (
                <button
                  type="button"
                  onClick={handlePurchaseClick}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  )}
                  {submitting ? "Processing..." : "Purchase"}
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:opacity-90 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : null}
                {submitting ? "Processing..." : (editingProduct ? "Update" : "Save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
