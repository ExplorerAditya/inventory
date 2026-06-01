import React from "react";
import { ShoppingBag } from "lucide-react";
import { useGetDashboardMetricsQuery } from "../../redux/services/api";
import Rating from "../../components/Rating";

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } =
    useGetDashboardMetricsQuery();

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
            Popular Products
          </h3>

          <hr />

          <div className="overflow-auto h-full">
            {dashboardMetrics?.popularProducts?.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      product.imageData ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8' font-family='sans-serif'%3ENo Img%3C/text%3E%3C/svg%3E"
                    }
                    alt={product.name}
                    className="rounded-lg w-14 h-14 object-cover"
                  />

                  <div className="flex flex-col justify-between gap-1">
                    <div className="font-bold text-gray-700">
                      {product.name}
                    </div>

                    <div className="flex text-sm items-center">
                      <span className="font-bold text-blue-500 text-xs">
                        ${product.price}
                      </span>

                      <span className="mx-2">|</span>

                      <Rating rating={product.rating || 0} />
                    </div>
                  </div>
                </div>

                <div className="text-xs flex items-center">
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  {Math.round(product.stockQuantity / 1000)}k Sold
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;