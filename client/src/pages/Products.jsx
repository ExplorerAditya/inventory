import React, { useState } from "react";
import { PlusCircle, Search, Pencil, Trash2 } from "lucide-react";
import Header from "../components/Header";
import Rating from "../components/Rating";
import CreateProductModal from "../components/CreateProductModal";
import EditProductModal from "../components/EditProductModal";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "../redux/services/api";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144' height='144' viewBox='0 0 144 144'%3E%3Crect width='144' height='144' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const { data: products, isLoading, isError } = useGetProductsQuery(searchTerm);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreate = async (data) => {
    try {
      await createProduct(data).unwrap();
    } catch (err) {
      alert(err?.data?.detail || "Failed to create product");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateProduct(data).unwrap();
    } catch (err) {
      alert(err?.data?.detail || "Failed to update product");
    }
  };

  const handleDelete = async (productId, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(productId).unwrap();
    } catch (err) {
      alert(err?.data?.detail || "Failed to delete product");
    }
  };

  if (isLoading) return <div className="py-4">Loading...</div>;
  if (isError || !products)
    return <div className="py-4 text-center text-red-500">Failed to fetch products</div>;

  return (
    <div className="mx-auto w-full pb-5">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center rounded border-2 border-gray-200">
          <Search className="m-2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded bg-white px-4 py-2 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Header name="Products" />
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Product
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.productId}
            className="mx-auto w-full max-w-full rounded-md border p-4 shadow"
          >
            <div className="flex flex-col items-center">
              {/* Product image served from DB */}
              <img
                src={product.imageData || PLACEHOLDER}
                alt={product.name}
                className="mb-3 h-36 w-36 rounded-2xl object-cover"
              />

              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-gray-800">${Number(product.price).toFixed(2)}</p>
              <div className="mt-1 text-sm text-gray-600">
                Stock: {product.stockQuantity}
              </div>
              {product.rating && (
                <div className="mt-2 flex items-center">
                  <Rating rating={product.rating} />
                </div>
              )}

              {/* Edit / Delete Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditProduct(product)}
                  className="flex items-center gap-1 rounded bg-amber-400 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product.productId, product.name)}
                  className="flex items-center gap-1 rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
      />

      {/* Edit Modal */}
      <EditProductModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        onUpdate={handleUpdate}
        product={editProduct}
      />
    </div>
  );
};

export default Products;