import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../components/Header";
import { useGetUsersQuery } from "../redux/services/api";

const columns = [
  {
    field: "userId",
    headerName: "ID",
    width: 90,
  },
  {
    field: "name",
    headerName: "Name",
    width: 200,
  },
  {
    field: "email",
    headerName: "Email",
    width: 250,
  },
];

const Users = () => {
  const {
    data: users,
    isError,
    isLoading,
  } = useGetUsersQuery();

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !users) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to fetch users
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name="Users" />

      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.userId}
        checkboxSelection
        autoHeight
        className="mt-5 rounded-lg border border-gray-200 bg-white shadow !text-gray-700"
      />
    </div>
  );
};

export default Users;