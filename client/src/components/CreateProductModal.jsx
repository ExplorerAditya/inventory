import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "../components/Header";

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    productId: uuidv4(),
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    imageData: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]:
        name === "price" ||
        name === "stockQuantity" ||
        name === "rating"
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageData: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);

    setFormData({
      productId: uuidv4(),
      name: "",
      price: 0,
      stockQuantity: 0,
      rating: 0,
      imageData: null,
    });

    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles =
    "block text-sm font-medium text-gray-700";

  const inputCssStyles =
    "block w-full mb-2 p-2 border-2 border-gray-500 rounded-md";

  return (
    <div className="fixed inset-0 z-20 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
        <Header name="Create New Product" />

        <form onSubmit={handleSubmit} className="mt-5">
          {/* Product Name */}
          <label className={labelCssStyles}>
            Product Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          {/* Price */}
          <label className={labelCssStyles}>
            Price
          </label>

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          {/* Stock Quantity */}
          <label className={labelCssStyles}>
            Stock Quantity
          </label>

          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          {/* Rating */}
          <label className={labelCssStyles}>
            Rating
          </label>

          <input
            type="number"
            name="rating"
            placeholder="Rating"
            value={formData.rating}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          {/* Product Image */}
          <label className={labelCssStyles}>
            Product Image <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full mb-2 text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />

          {/* Image preview */}
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
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create
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

export default CreateProductModal;