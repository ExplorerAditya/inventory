import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),

  tagTypes: [
    "DashboardMetrics",
    "Products",
    "Customers",
    "Orders",
    "Users",
    "Expenses",
  ],

  endpoints: (builder) => ({
    // ----------------------------------------------------------------
    // Dashboard
    // ----------------------------------------------------------------
    getDashboardMetrics: builder.query({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),

    // ----------------------------------------------------------------
    // Products
    // ----------------------------------------------------------------
    getProducts: builder.query({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),

    getProduct: builder.query({
      query: (productId) => `/products/${productId}`,
      providesTags: (_result, _err, id) => [{ type: "Products", id }],
    }),

    createProduct: builder.mutation({
      query: (newProduct) => {
        // Map camelCase frontend fields → snake_case backend fields
        const { imageData, stockQuantity, productId, ...rest } = newProduct;
        const body = {
          ...rest,
          stock_quantity: stockQuantity,
          ...(imageData != null ? { image_data: imageData } : {}),
        };
        return { url: "/products", method: "POST", body };
      },
      invalidatesTags: ["Products", "DashboardMetrics"],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, ...updates }) => {
        // Map camelCase → snake_case for any provided fields
        const { imageData, stockQuantity, ...rest } = updates;
        const body = {
          ...rest,
          ...(stockQuantity !== undefined ? { stock_quantity: stockQuantity } : {}),
          ...(imageData != null ? { image_data: imageData } : {}),
        };
        return { url: `/products/${productId}`, method: "PUT", body };
      },
      invalidatesTags: ["Products", "DashboardMetrics"],
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products", "DashboardMetrics"],
    }),

    // ----------------------------------------------------------------
    // Customers
    // ----------------------------------------------------------------
    getCustomers: builder.query({
      query: () => "/customers",
      providesTags: ["Customers"],
    }),

    getCustomer: builder.query({
      query: (customerId) => `/customers/${customerId}`,
      providesTags: (_result, _err, id) => [{ type: "Customers", id }],
    }),

    createCustomer: builder.mutation({
      query: (newCustomer) => ({
        url: "/customers",
        method: "POST",
        body: {
          full_name: newCustomer.fullName,
          email: newCustomer.email,
          phone: newCustomer.phone || null,
        },
      }),
      invalidatesTags: ["Customers", "DashboardMetrics"],
    }),

    deleteCustomer: builder.mutation({
      query: (customerId) => ({
        url: `/customers/${customerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers", "DashboardMetrics"],
    }),

    // ----------------------------------------------------------------
    // Orders
    // ----------------------------------------------------------------
    getOrders: builder.query({
      query: () => "/orders",
      providesTags: ["Orders"],
    }),

    getOrder: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (_result, _err, id) => [{ type: "Orders", id }],
    }),

    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: "/orders",
        method: "POST",
        body: {
          customer_id: newOrder.customerId,
          items: newOrder.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
        },
      }),
      invalidatesTags: ["Orders", "Products", "DashboardMetrics"],
    }),

    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders", "Products", "DashboardMetrics"],
    }),

    // ----------------------------------------------------------------
    // Legacy
    // ----------------------------------------------------------------
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    getExpensesByCategory: builder.query({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  // products
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  // customers
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  // orders
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  // legacy
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
} = api;