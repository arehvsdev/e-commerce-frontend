import { createSlice } from '@reduxjs/toolkit';
import { fetchProducts } from '../thunks/productThunks';

const initialState = {
  products: [],
  loading: false,
  error: null,
  totalPages: 1,
  totalProducts: 0,
  currentPage: 1,
  limit: 10,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action) => {
      state.loading = false;
      const data = action.payload;
      if (Array.isArray(data)) {
        state.products = data;
      } else if (data && data.products) {
        state.products = data.products;
        state.totalPages = data.totalPages || 1;
        state.totalProducts = data.totalProducts || 0;
        state.currentPage = data.page || 1;
        state.limit = data.limit || 10;
      }
    },
    fetchProductsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload && Array.isArray(payload)) {
          state.products = payload;
        } else if (payload && payload.products) {
          state.products = payload.products;
          state.totalPages = payload.totalPages || 1;
          state.totalProducts = payload.totalProducts || 0;
          state.currentPage = payload.page || 1;
          state.limit = payload.limit || 10;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { fetchProductsStart, fetchProductsSuccess, fetchProductsFailure } = productSlice.actions;
export default productSlice.reducer;
