import React, { useState } from "react";
import {
  PlusCircle,
  Trash2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import Header from "../components/Header";
import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useGetCustomersQuery,
  useGetProductsQuery,
} from "../redux/services/api";

// ─── Create Order Modal ────────────────────────────────────────────────────
const CreateOrderModal = ({ isOpen, onClose, onCreate, customers, products }) => {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  const addItem = () => setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: field === "quantity" ? parseInt(value) || 1 : value } : item
      )
    );
  };

  const getPreviewTotal = () => {
    return items.reduce((sum, item) => {
      const product = products?.find((p) => p.productId === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (!customerId || validItems.length === 0) return;
    onCreate({ customerId, items: validItems });
    setCustomerId("");
    setItems([{ productId: "", quantity: 1 }]);
    onClose();
  };

  if (!isOpen) return null;

  const selectCss =
    "block w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white text-sm";

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Create New Order</h2>

        <form onSubmit={handleSubmit}>
          {/* Customer selector */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer *
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className={selectCss + " mb-5"}
            required
          >
            <option value="">— Select a customer —</option>
            {customers?.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>

          {/* Order Items */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Order Items *</span>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(idx, "productId", e.target.value)}
                    className={selectCss + " flex-1"}
                    required
                  >
                    <option value="">— Select product —</option>
                    {products?.map((p) => (
                      <option key={p.productId} value={p.productId}>
                        {p.name} (${p.price} · stock: {p.stockQuantity})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    className="w-20 p-2.5 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview total */}
          {getPreviewTotal() > 0 && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700 font-medium">
              Estimated total: ${getPreviewTotal().toFixed(2)}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Place Order
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-200 py-2 font-semibold text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Order Card ────────────────────────────────────────────────────────────
const OrderCard = ({ order, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              #{order.order_id?.slice(0, 8)}…
            </p>
            <p className="text-xs text-gray-400">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-bold text-green-600 text-lg">
            ${Number(order.total_amount).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2.5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> View Details
            </>
          )}
        </button>

        <button
          onClick={() => onDelete(order.order_id)}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" /> Cancel
        </button>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-4 pt-3 space-y-2">
          {order.items?.map((item) => (
            <div
              key={item.item_id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="font-mono text-xs text-gray-400">
                  {item.product_id?.slice(0, 8)}…
                </span>
              </div>
              <div className="text-right text-gray-600">
                <span className="font-medium">{item.quantity} ×</span>{" "}
                <span>${Number(item.unit_price).toFixed(2)}</span>
                <span className="ml-2 font-semibold text-gray-800">
                  = ${(item.quantity * item.unit_price).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Orders Page ───────────────────────────────────────────────────────────
const Orders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: products = [] } = useGetProductsQuery();

  const [createOrder] = useCreateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const handleCreate = async (data) => {
    try {
      await createOrder(data).unwrap();
    } catch (err) {
      alert(err?.data?.detail || "Failed to create order");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await deleteOrder(orderId).unwrap();
    } catch (err) {
      alert(err?.data?.detail || "Failed to cancel order");
    }
  };

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading orders…</div>;
  if (isError) return <div className="py-8 text-center text-red-500">Failed to fetch orders.</div>;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="mx-auto w-full pb-5">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Header name="Orders" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-5 w-5" />
          Create Order
        </button>
      </div>

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Total Orders</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{orders.length}</p>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-100 px-5 py-4">
          <p className="text-xs text-green-500 font-medium uppercase tracking-wide">Total Revenue</p>
          <p className="text-2xl font-bold text-green-700 mt-1">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-purple-50 border border-purple-100 px-5 py-4 hidden sm:block">
          <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">Avg Order Value</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            ${orders.length ? (totalRevenue / orders.length).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          No orders yet. Click "Create Order" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.order_id}
              order={order}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        customers={customers}
        products={products}
      />
    </div>
  );
};

export default Orders;
