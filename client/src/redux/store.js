import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import globalReducer from "./slices/globalSlice";
import { api } from "./services/api";

export const store = configureStore({
  reducer: {
    global: globalReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

// Typed hooks (mirrors useAppDispatch / useAppSelector from the Next.js project)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
