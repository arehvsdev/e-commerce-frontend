import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import api from '../api/axios';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
  if (!product) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 font-semibold shadow-theme-xs">
        Product not found.
      </div>
    );
  }

  return (
    <div className="space-y-8" id="product-detail-page">
      {/* Product Detail Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-lg overflow-hidden p-6 md:p-10 flex flex-col md:flex-row gap-8">
        
        {/* Product Image Panel */}
        <div className="w-full md:w-1/2 min-h-[300px] max-h-[450px] bg-gray-50 flex items-center justify-center rounded-2xl overflow-hidden border border-gray-100">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 font-medium">No Image Available</span>
          )}
        </div>

        {/* Product Details Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-between py-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-2.5 block">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center mb-5 text-sm">
              <span className="text-yellow-500 mr-2 text-lg">★</span>
              <span className="text-gray-700 font-bold">
                {product.rating ? product.rating.toFixed(1) : '4.0'}
              </span>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-500">5.0 Rating</span>
            </div>

            {/* Price */}
            <p className="text-3xl font-black text-gray-950 mb-6">
              ₹{product.price ? product.price.toFixed(2) : '0.00'}
            </p>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center mb-6 gap-3">
              <span className="text-gray-700 font-bold text-sm">Availability:</span>
              {product.stock > 0 ? (
                <Badge color="success" variant="light">
                  In Stock ({product.stock})
                </Badge>
              ) : (
                <Badge color="error" variant="light">
                  Out of Stock
                </Badge>
              )}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-11">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer font-bold border-r border-gray-300 transition"
                  >
                    -
                  </button>
                  <span className="px-5 py-2 font-bold text-gray-800 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer font-bold border-l border-gray-300 transition"
                  >
                    +
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="px-8 h-11 text-xs"
                  size="sm"
                >
                  Add To Cart
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {token && recommendations.length > 0 && (
        <div className="pt-4">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-6">
            Recommended Products
          </h2>
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