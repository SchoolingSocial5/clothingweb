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
import { usePurchaseStore } from "@/store/usePurchaseStore";

export default function ProductsPage() {
  const { token } = useAuth();
  const { products, loading, fetchProducts, createProduct, updateProduct, deleteProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { addPurchase } = usePurchaseStore();
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
    if (!token) return;

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    formData.append("cost_price", newProduct.cost_price);
    formData.append("color", newProduct.color);
    formData.append("quantity", newProduct.quantity);
    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    if (editingProduct) {
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
      setNewProduct({ name: "", category: "", price: "", cost_price: "", color: "#000000", quantity: "0", image: null });
      setImagePreview(null);
      showToast(editingProduct ? "Product updated successfully" : "Product saved successfully", "success");
    } catch (err) {
      showToast("Error saving product", "error");
    }
  };

  const handlePurchase = async (quantity: number, cost: number) => {
    try {
      let productId = editingProduct?.id;

      // If it's a new product, we must create it first
      if (!productId) {
        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("category", newProduct.category);
        formData.append("price", newProduct.price);
        formData.append("cost_price", newProduct.cost_price);
        formData.append("color", newProduct.color);
        formData.append("quantity", "0"); // Start with 0, then add via purchase
        if (newProduct.image) {
          formData.append("image", newProduct.image);
        }

        const createdProduct = await createProduct(formData);
        productId = createdProduct.id;
      }

      await addPurchase({
        product_id: productId,
        quantity,
        cost_price: cost,
      });

      showToast("Purchase recorded and stock updated!", "success");
      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: "", category: "", price: "", cost_price: "", color: "#000000", quantity: "0", image: null });
      setImagePreview(null);
      await fetchProducts(); // Refresh stock in list
    } catch (error: any) {
      showToast(error.message || "Failed to record purchase", "error");
    }
  };

  return (
    <div className="p-[10px] md:p-8">
      <AdminPageHeader
        title="Products"
        description="View and manage your store inventory."
        stats={{ label: "Total", value: products.length }}
      >
        <button
          onClick={() => {
            setEditingProduct(null);
            setNewProduct({ name: "", category: "", price: "", cost_price: "", color: "#000000", quantity: "0", image: null });
            setImagePreview(null);
            setIsModalOpen(true);
          }}
          className="bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Product
        </button>
      </AdminPageHeader>


      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="hidden md:block font-bold text-lg">All Products ({products.length})</h3>
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
                  <th className="px-6 py-4 font-semibold text-center">Stock</th>
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
                            <img src={product.image_url.startsWith('http') ? product.image_url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${product.image_url}`} alt={product.name} className="w-full h-full object-cover" />
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
                      <span className="font-bold text-sm text-gray-900">{formatPrice(Number(product.price), settings?.currency_symbol || "₦")}</span>
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
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === page
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

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        onSubmit={handleSubmit}
        handleImageChange={handleImageChange}
        imagePreview={imagePreview}
        onPurchase={handlePurchase}
      />

      <DeleteConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to remove this product? This action cannot be undone."
      />

      <Toast 
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
