import React, { useState } from "react";
import { PlusCircle, Trash2, Mail, Phone, User } from "lucide-react";
import Header from "../components/Header";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
} from "../redux/services/api";

// ─── Create Customer Modal ─────────────────────────────────────────────────
const CreateCustomerModal = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(form);
    setForm({ fullName: "", email: "", phone: "" });
    onClose();
  };

  if (!isOpen) return null;

  const inputCss =
    "block w-full mb-3 p-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none";
  const labelCss = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Add Customer</h2>
        <form onSubmit={handleSubmit}>
          <label className={labelCss}>Full Name *</label>
          <input
            type="text"
            placeholder="John Smith"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            className={inputCss}
            required
          />

          <label className={labelCss}>Email Address *</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className={inputCss}
            required
          />

          <label className={labelCss}>Phone Number</label>
          <input
            type="tel"
            placeholder="555-0100"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className={inputCss}
          />

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Add Customer
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

// ─── Customers Page ────────────────────────────────────────────────────────
const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: customers = [], isLoading, isError } = useGetCustomersQuery();
  const [createCustomer] = useCreateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const handleCreate = async (data) => {
    try {
      await createCustomer(data).unwrap();
    } catch (err) {
      alert(err?.data?.detail || "Failed to add customer");
    }
  };

  const handleDelete = async (customerId, name) => {
    if (!window.confirm(`Remove customer "${name}"? All their orders will also be deleted.`)) return;
    try {
      await deleteCustomer(customerId).unwrap();
    } catch (err) {
      alert(err?.data?.detail || "Failed to delete customer");
    }
  };

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading customers…</div>;
  if (isError) return <div className="py-8 text-center text-red-500">Failed to fetch customers.</div>;

  return (
    <div className="mx-auto w-full pb-5">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <Header name="Customers" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-5 w-5" />
          Add Customer
        </button>
      </div>

      {/* Stats bar */}
      <div className="mb-6 rounded-xl bg-blue-50 border border-blue-100 px-6 py-4 flex items-center gap-3">
        <User className="h-6 w-6 text-blue-500" />
        <span className="text-blue-700 font-semibold text-lg">{customers.length}</span>
        <span className="text-blue-600">total customers</span>
      </div>

      {/* Customer Cards Grid */}
      {customers.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          No customers yet. Click "Add Customer" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <div
              key={customer.customer_id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {customer.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{customer.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{customer.customer_id?.slice(0, 8)}…</p>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>

              {/* Delete */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(customer.customer_id, customer.full_name)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default Customers;
