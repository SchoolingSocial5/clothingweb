"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { WholesaleProduct } from "@/store/useWholesaleProductStore";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface WholesaleProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: WholesaleProduct | null;
  newProduct: {
    name: string;
    category: string;
    price: string;
    cost_price: string;
    color: string;
    quantity: string;
    description?: string;
    min_order_quantity: string;
  };
  setNewProduct: (product: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  submitting?: boolean;
  onPurchase?: (quantity: string, costPrice: string) => Promise<void>;
}



const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

export default function WholesaleProductModal({
  isOpen,
  onClose,
  editingProduct,
  newProduct,
  setNewProduct,
  onSubmit,
  handleImageChange,
  imagePreview,
  submitting = false,
  onPurchase,
}: WholesaleProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  const labelCls = "text-sm font-bold text-gray-700 dark:text-gray-300";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {editingProduct ? "Edit Wholesale Product" : "Add New Wholesale Product"}
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
              placeholder="e.g. Bulk Wheat Flour"
              className={inputCls}
            />
          </div>

          {/* Prices Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Cost Price */}
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

            {/* Selling Price */}
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
          </div>

          {/* Stock Qty */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Stock Qty</label>
            <input
              type="number"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              placeholder="0"
              className={inputCls}
            />
          </div>

          {/* Color + Image upload side by side */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Color &amp; Image</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newProduct.color}
                onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                className="w-12 h-12 rounded-xl border border-gray-200 dark:border-neutral-700 cursor-pointer overflow-hidden p-0 flex-shrink-0"
                title="Pick color"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono uppercase w-20">{newProduct.color}</span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="wholesale-product-image"
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

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Description</label>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:dark:bg-neutral-800 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:dark:border-neutral-700 [&_.ql-container]:bg-white [&_.ql-container]:dark:bg-neutral-900 [&_.ql-editor]:text-gray-900 [&_.ql-editor]:dark:text-gray-100 [&_.ql-editor]:min-h-[120px] [&_.ql-toolbar_button]:text-gray-600 [&_.ql-toolbar_button]:dark:text-gray-400 [&_.ql-picker-label]:text-gray-600 [&_.ql-picker-label]:dark:text-gray-400 [&_.ql-stroke]:stroke-current [&_.ql-fill]:fill-current [&_.ql-container]:border-0 [&_.ql-toolbar]:rounded-t-none">
              <ReactQuill
                value={newProduct.description || ""}
                onChange={(val) => setNewProduct({ ...newProduct, description: val })}
                modules={quillModules}
                placeholder="Write a wholesale product description..."
                theme="snow"
              />
            </div>
          </div>

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
              {editingProduct && onPurchase && (
                <button
                  type="button"
                  onClick={() => onPurchase(newProduct.quantity, newProduct.cost_price)}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Purchase
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
