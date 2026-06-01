import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import { useGetExpensesByCategoryQuery } from "../redux/services/api";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();

  const expenses = useMemo(() => expensesData || [], [expensesData]);

  const parseDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const aggregatedData = useMemo(() => {
    const filtered = expenses
      .filter((item) => {
        const matchesCategory =
          selectedCategory === "All" ||
          item.category === selectedCategory;

        const dataDate = parseDate(item.date);

        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);

        return matchesCategory && matchesDate;
      })
      .reduce((acc, item) => {
        const amount = Number(item.amount);

        if (!acc[item.category]) {
          acc[item.category] = {
            name: item.category,
            amount: 0,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          };
        }

        acc[item.category].amount += amount;

        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  const classNames = {
    label: "block text-sm font-medium text-gray-700",
    selectInput:
      "mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !expensesData) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to fetch expenses
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <Header name="Expenses" />
        <p className="text-sm text-gray-500">
          A visual representation of expenses over time.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        {/* Filters */}
        <div className="w-full rounded-lg bg-white p-6 shadow md:w-1/3">
          <h3 className="mb-4 text-lg font-semibold">
            Filter by Category and Date
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="category"
                className={classNames.label}
              >
                Category
              </label>

              <select
                id="category"
                className={classNames.selectInput}
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
              >
                <option value="All">All</option>
                <option value="Office">Office</option>
                <option value="Professional">
                  Professional
                </option>
                <option value="Salaries">Salaries</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="startDate"
                className={classNames.label}
              >
                Start Date
              </label>

              <input
                type="date"
                id="startDate"
                className={classNames.selectInput}
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className={classNames.label}
              >
                End Date
              </label>

              <input
                type="date"
                id="endDate"
                className={classNames.selectInput}
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="flex-grow rounded-lg bg-white p-4 shadow md:p-6">
          <ResponsiveContainer
            width="100%"
            height={400}
          >
            <PieChart>
              <Pie
                data={aggregatedData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                dataKey="amount"
                label
                onMouseEnter={(_, index) =>
                  setActiveIndex(index)
                }
              >
                {aggregatedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === activeIndex
                        ? "rgb(29, 78, 216)"
                        : entry.color
                    }
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Expenses;