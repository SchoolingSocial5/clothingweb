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
}: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <input
                  list="categories-datalist"
                  required
                  type="text"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="e.g. Clothing"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
                <datalist id="categories-datalist">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Cost Price (₦)</label>
                <input
                  required
                  type="number"
                  value={newProduct.cost_price}
                  onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                  placeholder="70.00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Selling Price (₦)</label>
                <input
                  required
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="99.00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>

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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
              <input
                required
                type="number"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                placeholder="100"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Product Image {editingProduct && "(Optional)"}</label>
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
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition-all cursor-pointer overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg className="text-gray-400 mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <span className="text-xs font-bold text-gray-500">Upload high-quality image</span>
                      <span className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 2MB</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors cursor-pointer"
            >
              {editingProduct ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
