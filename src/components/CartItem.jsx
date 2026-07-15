import React from 'react';
import { useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../redux/slices/cartSlice';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const product = item.product;
  const productId = product._id || product.id;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ productId, quantity: item.quantity - 1 }));
    }
  };

  const handleIncrease = () => {
    if (item.quantity < (product.stock || 999)) {
      dispatch(updateQuantity({ productId, quantity: item.quantity + 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(productId));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-4" id={`cart-item-${productId}`}>
      <div className="flex items-center space-x-4 w-full sm:w-1/2">
        <div className="w-20 h-20 bg-gray-100 flex-shrink-0 flex items-center justify-center rounded overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          )}
        </div>
        <div>
          <span className="text-xs text-blue-500 uppercase font-semibold">{product.category}</span>
          <h4 className="text-gray-800 font-semibold line-clamp-1">{product.name}</h4>
          <p className="text-gray-500 text-sm">${product.price ? product.price.toFixed(2) : '0.00'} each</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-1/2 mt-4 sm:mt-0 space-x-8">
        <div className="flex items-center border border-gray-300 rounded">
          <button
            onClick={handleDecrease}
            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          >
            <FaMinus className="w-2 h-2" />
          </button>
          <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          >
            <FaPlus className="w-2 h-2" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-900 font-bold text-lg">
            ${(product.price * item.quantity).toFixed(2)}
          </span>
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
            title="Remove item"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;