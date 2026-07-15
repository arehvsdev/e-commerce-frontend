import { createSlice } from '@reduxjs/toolkit';

const cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

const initialState = {
  cartItems,
  total,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existingItem = state.cartItems.find(item => item.product._id === product._id || item.product.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ product, quantity });
      }
      
      state.total = state.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter(item => item.product._id !== productId && item.product.id !== productId);
      state.total = state.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const existingItem = state.cartItems.find(item => item.product._id === productId || item.product.id === productId);
      
      if (existingItem) {
        existingItem.quantity = quantity;
      }
      
      state.total = state.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.total = 0;
      localStorage.removeItem('cartItems');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
