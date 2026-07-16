export const cartMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type.startsWith('cart/')) {
    const state = store.getState();
    localStorage.setItem('cartItems', JSON.stringify(state.cart.cartItems));
  }
  return result;
};
