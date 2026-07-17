import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrdersStart, fetchOrdersSuccess, fetchOrdersFailure } from '../redux/slices/orderSlice';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    dispatch(fetchOrdersStart());
    try {
      const response = await api.get('/orders');
      const data = response.data.data?.orders || [];
      dispatch(fetchOrdersSuccess(data));
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      dispatch(fetchOrdersFailure(message));
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6" id="orders-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Order History
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and review your past purchases.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-theme-xs">
          <p className="text-gray-500 text-lg mb-6 font-medium">You have not placed any orders yet.</p>
          <Link to="/">
            <Button size="sm">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Order ID</TableCell>
                <TableCell isHeader>Date</TableCell>
                <TableCell isHeader>Product Details</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader align="right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const orderId = order._id || order.id;
                return (
                  <TableRow key={orderId}>
                    {/* Order ID */}
                    <TableCell className="font-mono text-xs font-bold text-gray-650">
                      {orderId}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* Product info inside order */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-150 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {order.product?.image ? (
                            <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-400">No Image</span>
                          )}
                        </div>
                        <div className="truncate max-w-[150px] sm:max-w-xs">
                          <span className="font-semibold text-gray-850 truncate block">
                            {order.product?.name || 'Product Deleted'}
                          </span>
                          <span className="text-xs text-gray-500 block mt-0.5">
                            Qty: {order.quantity}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="font-bold text-gray-950">
                      ₹{(order.totalAmount || 0).toFixed(2)}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge color={getStatusColor(order.status)} variant="light">
                        {order.status}
                      </Badge>
                    </TableCell>

                    {/* View details action button */}
                    <TableCell align="right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="py-1 px-3 text-xs"
                        onClick={() => openOrderDetails(order)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={closeOrderDetails} className="max-w-lg p-6">
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Order Details
              </h3>
              <p className="text-xs font-mono text-gray-500 mt-1">
                ID: {selectedOrder._id || selectedOrder.id}
              </p>
            </div>

            <div className="space-y-4 border-t border-b border-gray-100 py-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Order Status:</span>
                <Badge color={getStatusColor(selectedOrder.status)} variant="solid">
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Placed On:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-semibold text-gray-850 uppercase">
                  {selectedOrder.paymentMethod?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Product details */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Items Ordered</span>
              <div className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-16 h-16 bg-white border border-gray-150 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {selectedOrder.product?.image ? (
                    <img src={selectedOrder.product.image} alt={selectedOrder.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-850 text-sm">
                    {selectedOrder.product?.name || 'Product Deleted'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {selectedOrder.quantity} &times; ₹{selectedOrder.product?.price?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 font-extrabold text-lg text-gray-900">
              <span>Total Paid</span>
              <span>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={closeOrderDetails}>
                Close
              </Button>
              {selectedOrder.product && (
                <Link to={`/products/${selectedOrder.product._id || selectedOrder.product.id}`}>
                  <Button size="sm" onClick={closeOrderDetails}>
                    View Product
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;