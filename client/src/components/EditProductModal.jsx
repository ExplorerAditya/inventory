import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const EditProductModal = ({ isOpen, onClose, onUpdate, product }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    imageData: null,
  });

  // Pre-fill when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || 0,
        stockQuantity: product.stockQuantity || 0,
        rating: product.rating || 0,
        imageData: product.imageData || null,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({ ...prev, imageData: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ productId: product.productId, ...formData });
    onClose();
  };

  if (!isOpen) return null;

  const labelCss = "block text-sm font-medium text-gray-700";
  const inputCss = "block w-full mb-2 p-2 border-2 border-gray-500 rounded-md";

  return (
    <div className="fixed inset-0 z-20 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
        <Header name="Edit Product" />

        <form onSubmit={handleSubmit} className="mt-5">
          <label className={labelCss}>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputCss}
            required
          />

          <label className={labelCss}>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={inputCss}
            required
          />

          <label className={labelCss}>Stock Quantity</label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            className={inputCss}
            required
          />

          <label className={labelCss}>Rating</label>
          <input
            type="number"
            name="rating"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            className={inputCss}
          />

          <label className={labelCss}>
            Product Image{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full mb-2 text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {formData.imageData && (
            <div className="mb-3 flex justify-center">
              <img
                src={formData.imageData}
                alt="Preview"
                className="h-24 w-24 rounded-xl object-cover border-2 border-blue-200 shadow"
              />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
