import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { useGetProductsQuery } from "../redux/services/api";

const columns = [
  { field: "productId", headerName: "ID", width: 220 },
  { field: "name", headerName: "Product Name", width: 200 },
  { field: "sku", headerName: "SKU", width: 120 },
  {
    field: "price",
    headerName: "Price",
    width: 110,
    valueFormatter: (value) => `$${Number(value).toFixed(2)}`,
  },
  {
    field: "stockQuantity",
    headerName: "Stock",
    width: 100,
    cellClassName: (params) =>
      params.value <= 5 ? "text-red-600 font-bold" : "",
  },
  {
    field: "rating",
    headerName: "Rating",
    width: 100,
    valueFormatter: (value) => (value ? `${value} ★` : "N/A"),
  },
];

const Inventory = () => {
  const { data: products, isError, isLoading } = useGetProductsQuery();

  if (isLoading) return <div className="py-4">Loading...</div>;
  if (isError || !products)
    return (
      <div className="py-4 text-center text-red-500">Failed to fetch products</div>
    );

  return (
    <div className="flex flex-col">
      <Header name="Inventory" />
      <DataGrid
        rows={products}
        columns={columns}
        getRowId={(row) => row.productId}
        checkboxSelection
        className="mt-5 rounded-lg border border-gray-200 bg-white shadow !text-gray-700"
        autoHeight
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};

export default Inventory;