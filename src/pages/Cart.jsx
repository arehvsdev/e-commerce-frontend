import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cartItems, total } = useSelector((state) => state.cart);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="cart-page">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow border border-gray-200">
          <p className="text-gray-500 text-lg mb-6">Your shopping cart is empty.</p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            {cartItems.map((item) => (
              <CartItem key={item.product._id || item.product.id} item={item} />
            ))}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-4 mb-4">
                Order Summary
              </h3>
              
              <div className="flex justify-between text-gray-600 mb-4">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-6">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              
              <div className="flex justify-between border-t border-gray-200 pt-4 mb-6 font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors"
              >
                Proceed to Checkout
              </Link>
              
              <div className="mt-4 text-center">
                <Link to="/" className="text-sm text-blue-600 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;