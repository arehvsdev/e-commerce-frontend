import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';

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

    if (shippingAddress.trim().length < 10 || shippingAddress.trim().length > 300) {
      return toast.error('Shipping address must be between 10 and 300 characters');
    }

    setSubmitting(true);
    try {
      const orderPromises = cartItems.map((item) => {
        return api.post('/orders', {
          productId: item.product._id || item.product.id,
          quantity: item.quantity,
          paymentMethod: paymentMethod,
          shippingAddress: shippingAddress,
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
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-theme-xs" id="checkout-page">
        <p className="text-gray-500 text-lg mb-6 font-medium">Your cart is empty. You cannot checkout.</p>
        <Link to="/">
          <Button size="sm">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="checkout-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete your billing information and place your order.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Shipping Form Card */}
        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
            Shipping Information
          </h3>

          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div>
              <Label htmlFor="shippingAddress">
                Shipping Address <span className="text-error-500">*</span>
              </Label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-gray-300 bg-transparent text-gray-800 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 shadow-theme-xs"
                placeholder="123 Main St, Apt 4B, New York, NY 10001"
                required
              ></textarea>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="h-4.5 w-4.5 text-brand-500 focus:ring-brand-500/20 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
                    Credit Card
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="h-4.5 w-4.5 text-brand-500 focus:ring-brand-500/20 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
                    PayPal
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                    className="h-4.5 w-4.5 text-brand-500 focus:ring-brand-500/20 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
                    Cash on Delivery (COD)
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full justify-center"
                size="sm"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary Item List */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
              Your Items
            </h3>

            <div className="max-h-60 overflow-y-auto pr-2 space-y-4 divide-y divide-gray-100 no-scrollbar">
              {cartItems.map((item, index) => (
                <div key={item.product._id || item.product.id} className={`flex justify-between items-center text-sm ${index > 0 ? 'pt-4' : ''}`}>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{item.product.name}</span>
                    <span className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity}</span>
                  </div>
                  <span className="font-extrabold text-gray-900">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-extrabold text-lg text-gray-900">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
