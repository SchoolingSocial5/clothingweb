"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProductStore, Product } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { formatPrice } from "@/utils/format";
import { useSettings } from "@/context/SettingsContext";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Toast from "@/components/admin/Toast";
import ProductModal from "@/components/admin/ProductModal";
import TableLoader from "@/components/admin/TableLoader";
import { usePurchaseStore } from "@/store/usePurchaseStore";
import { getImageUrl } from "@/utils/image";

export default function ProductsPage() {
  const { token, user } = useAuth();
  const { 
    products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct,
    selectedProductIds, toggleProductSelection, toggleAllProducts, clearProductSelection, bulkDeleteProducts
  } = useProductStore();
  const { addPurchase } = usePurchaseStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    cost_price: "",
    color: "#000000",
    quantity: "0",
    description: "",
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const itemsPerPage = 20;

  const filteredProducts = products.filter(p => {
    if (!search.trim()) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.category.toLowerCase().includes(search.toLowerCase());
  });

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      cost_price: product.cost_price || "",
      color: product.color,
      quantity: product.quantity.toString(),
      description: product.description || "",
      image: null
    });
    if (product.image_url) {
      setImagePreview(getImageUrl(product.image_url));
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId || !token) return;
    try {
      await deleteProduct(deleteId);
      showToast("Product deleted successfully", "success");
    } catch {
      showToast("Failed to delete product", "error");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProduct({ ...newProduct, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || submitting) return;

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    formData.append("cost_price", newProduct.cost_price);
    formData.append("color", newProduct.color);
    formData.append("description", newProduct.description || "");
    formData.append("quantity", newProduct.quantity);
    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    if (editingProduct) {
      formData.append("_method", "PUT");
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: "", category: "", price: "", cost_price: "", color: "#000000", quantity: "0", description: "", image: null });
      setImagePreview(null);
      showToast(editingProduct ? "Product updated successfully" : "Product saved successfully", "success");
    } catch (err: any) {
      showToast(err?.message || "Error saving product", "error");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handlePurchase = async (quantity: string, cost_price: string) => {
    if (!editingProduct || !token || submitting) return;
    setSubmitting(true);
    try {
      await addPurchase({
        product_id: editingProduct.id,
        quantity: quantity,
        cost_price: cost_price
      });
      await fetchProducts();
      showToast("Purchase recorded successfully", "success");
    } catch (err: any) {
      showToast(err?.message || "Error recording purchase", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-[10px] md:p-8">
      <AdminPageHeader
        title="Retail Products"
        description="View and manage your retail inventory."
        stats={{ label: "Total Retail", value: products.length }}
      >
        <button
          onClick={() => {
            setEditingProduct(null);
            setNewProduct({ name: "", category: "", price: "", cost_price: "", color: "#000000", quantity: "0", description: "", image: null });
            setImagePreview(null);
            setIsModalOpen(true);
          }}
          className="bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Product
        </button>
      </AdminPageHeader>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="hidden md:block font-bold text-lg">All Products ({products.length})</h3>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
                setIsSearching(true);
                setTimeout(() => setIsSearching(false), 400);
              }}
              placeholder="Search products..."
              className="w-64 pl-10 pr-9 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100 dark:placeholder-gray-500"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-neutral-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold text-center w-16">S/N</th>
                  <th className="px-2 py-4 w-8"></th>
                  <th className="px-6 py-4 font-semibold">Product Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Color</th>
                  <th className="px-6 py-4 font-semibold text-right">Price</th>
                  <th className="px-6 py-4 font-semibold text-center">Stock</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-2 py-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-5 h-5 rounded-lg border-gray-200 text-black focus:ring-black cursor-pointer transition-all"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100 ${product.image_url ? 'cursor-pointer hover:ring-2 hover:ring-black transition-all' : ''}`}
                          onClick={() => {
                            if (!product.image_url) return;
                            setPreviewImage(getImageUrl(product.image_url));
                          }}
                        >
                          {product.image_url ? (
                            <img
                              src={getImageUrl(product.image_url) || ""}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <svg className="text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: #{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: product.color }}></div>
                        <span className="text-xs text-gray-600">{product.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{formatPrice(Number(product.price), settings?.currency_symbol || "₦")}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${product.quantity > 10 ? 'bg-green-100 text-green-800' :
                          product.quantity > 0 ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {product.quantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1-1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && <TableLoader colSpan={8} />}
              </tbody>
            </table>
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="text-red-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Failed to load products</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">{error}</p>
                <button 
                  onClick={() => fetchProducts()}
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:scale-105 transition-transform"
                >
                  Try Again
                </button>
              </div>
            )}
            {!loading && !error && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No retail products found</p>
                {search && (
                   <button onClick={() => setSearch('')} className="mt-2 text-xs font-bold underline text-gray-500 hover:text-black">Clear search</button>
                )}
              </div>
            )}
        </div>

        {/* Pagination Controls */}
        {filteredProducts.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-800/30 flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> results
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === page
                      ? "bg-black text-white shadow-lg shadow-black/20"
                      : "text-gray-500 hover:bg-white hover:text-black border border-transparent hover:border-gray-200"
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedProductIds.length > 0 && user?.position === 'Director' && (
        <div className="mt-8 bg-black text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10 flex-wrap gap-4">
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg">
              {selectedProductIds.length} Selected
            </span>
            <div className="hidden sm:block h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Actions</span>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={bulkUpdating}
                className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                Delete
              </button>
            </div>
          </div>
          <button onClick={clearProductSelection} className="text-white/40 hover:text-white transition-all p-2 flex items-center gap-2 group active:scale-90">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Clear</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          if (submitting) return;
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        onSubmit={handleSubmit}
        onPurchase={handlePurchase}
        handleImageChange={handleImageChange}
        imagePreview={imagePreview}
        submitting={submitting}
      />

      <DeleteConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to remove this product? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={async () => {
          setBulkUpdating(true);
          try {
            await bulkDeleteProducts(selectedProductIds);
            setShowBulkDeleteConfirm(false);
            showToast(`Successfully deleted ${selectedProductIds.length} products`);
          } catch {
            showToast("Failed to delete products", "error");
          } finally {
            setBulkUpdating(false);
          }
        }}
        title="Delete Products"
        message={`Are you sure you want to delete ${selectedProductIds.length} selected product${selectedProductIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors p-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img
              src={previewImage}
              alt="Product preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
