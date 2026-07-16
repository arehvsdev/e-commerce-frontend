import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import Button from './ui/Button';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const productId = product._id || product.id;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };
  
  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs hover:shadow-theme-md transition-all duration-300 flex flex-col h-full overflow-hidden" 
      id={`product-card-${productId}`}
    >
      <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100 group">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="text-gray-400 text-sm font-medium">No Image Available</span>
        )}
        
        {product.stock <= 0 && (
          <span className="absolute top-3 right-3 bg-error-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Sold Out
          </span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1.5 block">
          {product.category}
        </span>
        <Link to={`/products/${productId}`}>
          <h3 className="text-gray-800 font-bold text-lg line-clamp-1 mb-2 hover:text-brand-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating if available */}
        <div className="flex items-center mb-4 text-sm">
          <span className="text-yellow-500 mr-1.5 text-base">★</span>
          <span className="text-gray-600 font-semibold">
            {product.rating ? product.rating.toFixed(1) : '4.0'}
          </span>
          <span className="text-gray-400 mx-1.5">|</span>
          <span className="text-gray-500 text-xs">
            ({product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'})
          </span>
        </div>

        <p className="text-gray-950 font-extrabold text-2xl mb-5">
          ₹{product.price ? product.price.toFixed(2) : '0.00'}
        </p>
        
        <div className="mt-auto grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <Link to={`/products/${productId}`} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs py-2 px-2"
            >
              Details
            </Button>
          </Link>
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            variant="primary"
            size="sm"
            className="w-full text-xs py-2 px-2"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;