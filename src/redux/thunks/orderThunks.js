import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders');
      return response.data.data.orders;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      return rejectWithValue(message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data.order;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      return rejectWithValue(message);
    }
  }
);
