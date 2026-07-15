import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      return toast.error('Shipping address is required');
    }

    setSubmitting(true);
    try {
      const orderPromises = cartItems.map((item) => {
        return api.post('/orders', {
          productId: item.product._id || item.product.id,
          quantity: item.quantity,
          paymentMethod: paymentMethod,
        });
      });

      await Promise.all(orderPromises);

      toast.success('Orders placed successfully!');
      dispatch(clearCart());
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20" id="checkout-page">
        <p className="text-gray-500 text-lg mb-6">Your cart is empty. You cannot checkout.</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="checkout-page">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-4 mb-6">
            Shipping Information
          </h3>

          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Shipping Address</label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                placeholder="123 Main St, Apt 4B, New York, NY 10001"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Credit Card</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">PayPal</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors disabled:bg-gray-400 cursor-pointer"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-4 mb-4">
              Your Items
            </h3>

            <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product._id || item.product.id} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{item.product.name}</span>
                    <span className="text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-gray-900">
              <span>Total Amount</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
