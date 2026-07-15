import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersStart, fetchOrdersSuccess, fetchOrdersFailure } from '../redux/slices/orderSlice';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  const fetchOrders = async () => {
    dispatch(fetchOrdersStart());
    try {
      const response = await api.get('/orders');
      const data = response.data.data;
      dispatch(fetchOrdersSuccess(data || []));
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      dispatch(fetchOrdersFailure(message));
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="orders-page">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-lg shadow">
          <p className="text-gray-500 text-lg">You have not placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id || order.id}
              className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden p-6"
              id={`order-card-${order._id || order.id}`}
            >
              <div className="flex flex-col sm:flex-row justify-between border-b border-gray-200 pb-4 mb-4 gap-2">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Order ID</span>
                  <p className="text-sm font-bold text-gray-700">{order._id || order.id}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Placed On</span>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Payment Method</span>
                  <p className="text-sm font-medium text-gray-700 uppercase">{order.paymentMethod?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase">Status</span>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded overflow-hidden flex-shrink-0">
                    {order.product?.image ? (
                      <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-bold">{order.product?.name || 'Product Deleted'}</h4>
                    <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                  </div>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto">
                  <span className="text-xs font-semibold text-gray-400 uppercase block">Total Amount</span>
                  <span className="text-xl font-extrabold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;