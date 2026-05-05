import { configureStore } from "@reduxjs/toolkit";
import walletReducer from "./slices/walletSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
