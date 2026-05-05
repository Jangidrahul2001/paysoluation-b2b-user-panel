import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import { apiEndpoints } from "../../api/apiEndpoints";
import { toast } from "sonner";

export const fetchProfile = createAsyncThunk(
  "adminProfile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(apiEndpoints.fetchProfile);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch Profile");
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: {
      //  firstName:"",
      //  lastName:"",
      //  userName:"",
      //  email:"",
      //  phone:"",
      //  role:"",
      //  kycStatus:""
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data;
      })
      .addCase(fetchProfile.rejected, (state, action) => {        
        state.loading = false;
        state.error = action.payload;
      
      });
  },
});

export default profileSlice.reducer;
