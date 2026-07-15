import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const productId = product._id || product.id;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col h-full" id={`product-card-${productId}`}>
      <div className="h-48 bg-gray-100 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">No Image Available</span>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-500 mb-1">
          {product.category}
        </span>
        <h3 className="text-gray-800 font-semibold text-lg line-clamp-1 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-900 font-bold text-xl mb-4">
          ${product.price ? product.price.toFixed(2) : '0.00'}
        </p>
        
        <Link
          to={`/products/${productId}`}
          className="mt-auto block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;