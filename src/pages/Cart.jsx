import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateQuantity, removeFromCart } from '../redux/slices/cartSlice';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleDecrease = (item) => {
    const product = item.product;
    const productId = product._id || product.id;
    if (item.quantity > 1) {
      dispatch(updateQuantity({ productId, quantity: item.quantity - 1 }));
    }
  };

  const handleIncrease = (item) => {
    const product = item.product;
    const productId = product._id || product.id;
    if (item.quantity < (product.stock || 999)) {
      dispatch(updateQuantity({ productId, quantity: item.quantity + 1 }));
    }
  };

  const handleRemove = (productId, name) => {
    dispatch(removeFromCart(productId));
    toast.success(`${name} removed from cart`);
  };

  return (
    <div className="space-y-6" id="cart-page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Shopping Cart
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review your items and proceed to checkout.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-theme-xs">
          <p className="text-gray-500 text-lg mb-6 font-medium">Your shopping cart is empty.</p>
          <Link to="/">
            <Button size="sm">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Table */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Product</TableCell>
                    <TableCell isHeader>Price</TableCell>
                    <TableCell isHeader>Quantity</TableCell>
                    <TableCell isHeader>Total</TableCell>
                    <TableCell isHeader align="right">Remove</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => {
                    const product = item.product;
                    const productId = product._id || product.id;
                    return (
                      <TableRow key={productId}>
                        {/* Product Detail */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-50 border border-gray-150 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs text-gray-400">No Image</span>
                              )}
                            </div>
                            <div className="truncate max-w-[200px] sm:max-w-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500 block mb-0.5">
                                {product.category}
                              </span>
                              <Link to={`/products/${productId}`} className="font-semibold text-gray-850 hover:text-brand-500 transition-colors truncate block">
                                {product.name}
                              </Link>
                            </div>
                          </div>
                        </TableCell>

                        {/* Price */}
                        <TableCell className="font-medium text-gray-900">
                          ₹{product.price ? product.price.toFixed(2) : '0.00'}
                        </TableCell>

                        {/* Quantity controls */}
                        <TableCell>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-24 h-9 bg-gray-50">
                            <button
                              onClick={() => handleDecrease(item)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-bold text-gray-800 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrease(item)}
                              disabled={item.quantity >= (product.stock || 999)}
                              className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                              +
                            </button>
                          </div>
                        </TableCell>

                        {/* Total */}
                        <TableCell className="font-bold text-gray-950">
                          ₹{(product.price * item.quantity).toFixed(2)}
                        </TableCell>

                        {/* Remove */}
                        <TableCell align="right">
                          <button
                            onClick={() => handleRemove(productId, product.name)}
                            className="text-gray-400 hover:text-error-500 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                            title="Remove item"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                Order Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className="text-success-600 font-bold">Free</span>
                </div>
              </div>
              
              <div className="flex justify-between border-t border-gray-100 pt-4 font-extrabold text-lg text-gray-900">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <div className="pt-2 space-y-3">
                <Link to="/checkout" className="block w-full">
                  <Button className="w-full justify-center" size="sm">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link to="/" className="block text-center text-sm font-medium text-brand-500 hover:text-brand-600 hover:underline">
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