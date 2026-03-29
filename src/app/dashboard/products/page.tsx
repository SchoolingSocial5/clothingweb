"use client";
import { useEffect, useState } from "react";
import { useProductStore, Product } from "@/store/useProductStore";

export default function ProductsPage() {
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Clothing",
    price: "",
    color: "#000000",
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      color: product.color,
      image: null
    });
    setImagePreview(product.image_url || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
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
    
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    formData.append("color", newProduct.color);
    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    if (editingProduct) {
      // Laravel PUT with FormData usually requires _method override
      formData.append("_method", "PUT");
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: "", category: "Clothing", price: "", color: "#000000", image: null });
      setImagePreview(null);
      showToast(editingProduct ? "Product updated successfully" : "Product saved successfully", "success");
    } catch (err) {
      showToast("Error saving product", "error");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Products Management</h2>
          <p className="text-gray-500 text-sm">View and manage your store inventory.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setNewProduct({ name: "", category: "Clothing", price: "", color: "#000000", image: null });
            setImagePreview(null);
            setIsModalOpen(true);
          }}
          className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Product
        </button>
      </div>


      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg">All Products ({products.length})</h3>
          <div className="relative">
            <input type="text" placeholder="Search products..." className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold text-center w-16">S/N</th>
                  <th className="px-6 py-4 font-semibold">Product Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Color</th>
                  <th className="px-6 py-4 font-semibold text-right">Price</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{product.name}</p>
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
                      <span className="font-bold text-sm text-gray-900">${product.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
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
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && products.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, products.length)}</span> of <span className="font-medium">{products.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              
              {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                    currentPage === page 
                      ? "bg-black text-white shadow-lg shadow-black/20" 
                      : "text-gray-500 hover:bg-white hover:text-black border border-transparent hover:border-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(products.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(products.length / itemsPerPage)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }} 
                className="text-gray-400 hover:text-black p-1"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Minimalist Linen Shirt" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    >
                      <option>Clothing</option>
                      <option>Accessories</option>
                      <option>Footwear</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Price ($)</label>
                    <input 
                      required
                      type="number" 
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
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
                      onChange={(e) => setNewProduct({...newProduct, color: e.target.value})}
                      className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0"
                    />
                    <span className="text-sm text-gray-500 font-mono uppercase">{newProduct.color}</span>
                  </div>
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="text-red-500" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Confirm Deletion</h3>
              <p className="text-gray-500 mb-8 px-4">Are you sure you want to remove this product? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3.5 border border-gray-100 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  No, Keep it
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3.5 bg-red-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Yes, Delete it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 z-[70] transition-all duration-500 transform ${toast.visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border ${
          toast.type === "success" ? "bg-green-50 border-green-100 text-green-800" : 
          toast.type === "error" ? "bg-red-50 border-red-100 text-red-800" : 
          "bg-amber-50 border-amber-100 text-amber-800"
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            toast.type === "success" ? "bg-green-500 text-white" : 
            toast.type === "error" ? "bg-red-500 text-white" : 
            "bg-amber-500 text-white"
          }`}>
            {toast.type === "success" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : toast.type === "error" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            )}
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">{toast.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

