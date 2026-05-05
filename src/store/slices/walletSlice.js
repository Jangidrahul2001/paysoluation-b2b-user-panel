import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { apiEndpoints } from "../../api/apiEndpoints";

export const fetchWallet = createAsyncThunk(
  "userWallet/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(apiEndpoints.fetchWallet);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch wallet");
    }
  },
);

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    data: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default walletSlice.reducer;
