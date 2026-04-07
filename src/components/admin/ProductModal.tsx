import { useState, useRef, useEffect } from "react";
import { Product } from "@/store/useProductStore";
import { Category } from "@/store/useCategoryStore";

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
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-left flex items-center justify-between text-sm"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Select category"}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5"
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400 italic">No categories available</p>
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onChange(cat.name); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  value === cat.name ? "font-bold text-black bg-gray-50" : "text-gray-700"
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-[10px] md:px-8 py-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-[10px] md:p-8 space-y-5 overflow-y-auto flex-1">
          {/* Product Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Product Name</label>
            <input
              required
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="e.g. Minimalist Linen Shirt"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          {/* Category + Cost Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <CategoryDropdown
                value={newProduct.category}
                categories={categories}
                onChange={(val) => setNewProduct({ ...newProduct, category: val })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Cost Price (₦)</label>
              <input
                required
                type="number"
                min="0"
                value={newProduct.cost_price}
                onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                placeholder="70.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Selling Price + Stock Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Selling Price (₦)</label>
              <input
                required
                type="number"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="99.00"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">
                Stock Qty
                <span className="ml-1 text-[10px] font-normal text-gray-400">(for Purchase only)</span>
              </label>
              <input
                type="number"
                min="0"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Product Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newProduct.color}
                onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0"
              />
              <span className="text-sm text-gray-500 font-mono uppercase">{newProduct.color}</span>
            </div>
          </div>

          {/* Image */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">
              Product Image {editingProduct && <span className="font-normal text-gray-400">(Optional)</span>}
            </label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="product-image"
              />
              <label
                htmlFor="product-image"
                className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition-all cursor-pointer overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="text-gray-400 mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span className="text-xs font-bold text-gray-500">Upload image</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 2MB</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Purchase error */}
          {purchaseError && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 px-4 py-2.5 rounded-xl">{purchaseError}</p>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col-reverse md:flex-row gap-3 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  title="Record stock purchase and add to inventory"
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
                className="flex-1 px-4 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {submitting ? "Processing..." : (editingProduct ? "Update" : "Save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
