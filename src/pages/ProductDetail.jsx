import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import api from '../api/axios';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const productResponse = await api.get(`/products/${id}`);
      const productData = productResponse.data.data;
      setProduct(productData);

      if (token) {
        try {
          const recResponse = await api.get(`/recommendations/product/${id}`);
          const recData = recResponse.data.data;
          setRecommendations(recData.recommendedProducts || []);
        } catch (recErr) {
          console.warn('Failed to load recommendations', recErr);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    setQuantity(1);
  }, [id, token]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ product, quantity }));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="product-detail-page">
      <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden p-6 md:p-12 mb-12 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 max-h-[400px] bg-gray-100 flex items-center justify-center rounded overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">No Image Available</span>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          <span className="text-sm font-semibold uppercase text-blue-500 mb-2">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <span className="text-yellow-500 mr-2 text-xl">★</span>
            <span className="text-gray-600 font-medium">{product.rating ? product.rating.toFixed(1) : '0.0'} / 5.0</span>
          </div>

          <p className="text-2xl font-bold text-gray-900 mb-6">${product.price ? product.price.toFixed(2) : '0.00'}</p>

          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

          <div className="mt-auto border-t border-gray-100 pt-6">
            <div className="flex items-center mb-6">
              <span className="text-gray-700 mr-4 font-semibold">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-sm">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded text-sm">
                  Out of Stock
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded transition-colors cursor-pointer"
                >
                  Add To Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {token && recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">People Also Liked (AI Recommendations)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <ProductCard key={rec._id || rec.id} product={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;