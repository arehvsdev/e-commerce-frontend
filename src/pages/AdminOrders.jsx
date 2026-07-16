import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import Label from '../components/ui/Label';
import Button from '../components/ui/Button';
import { PencilIcon } from '../icons';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/admin');
      const data = response.data.data?.orders || [];
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setStatus(order.status || 'Pending');
    setShowModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    const orderId = selectedOrder._id || selectedOrder.id;
    try {
      await api.put(`/orders/admin/${orderId}`, { status });
      toast.success('Order status updated successfully');
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (orderStatus) => {
    switch (orderStatus?.toLowerCase()) {
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
    <div className="space-y-6" id="admin-orders-page">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Order Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track customer transactions and manage shipment statuses.
        </p>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-xs overflow-hidden">
        {orders.length === 0 ? (
          <p className="p-12 text-center text-gray-500 font-medium">No orders found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Order ID</TableCell>
                <TableCell isHeader>Date</TableCell>
                <TableCell isHeader>Customer</TableCell>
                <TableCell isHeader>Product Info</TableCell>
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
                    <TableCell className="font-mono text-xs font-bold text-gray-500">
                      {orderId}
                    </TableCell>

                    {/* Placed Date */}
                    <TableCell className="font-medium text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="font-semibold text-gray-950">
                      {order.user?.name || 'Guest User'}
                      <span className="text-xs text-gray-500 block font-normal mt-0.5">
                        {order.user?.email || ''}
                      </span>
                    </TableCell>

                    {/* Product */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-150 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {order.product?.image ? (
                            <img src={order.product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-400">No Image</span>
                          )}
                        </div>
                        <div className="truncate max-w-[150px] sm:max-w-xs font-semibold text-gray-850">
                          {order.product?.name || 'Product Deleted'}
                          <span className="text-xs font-normal text-gray-500 block mt-0.5">
                            Qty: {order.quantity}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="font-bold text-gray-900">
                      ₹{(order.totalAmount || 0).toFixed(2)}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge color={getStatusColor(order.status)} variant="light">
                        {order.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <button
                        onClick={() => openUpdateModal(order)}
                        className="text-gray-400 hover:text-brand-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                        title="Update Status"
                      >
                        <PencilIcon className="size-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal for Order Status Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        className="max-w-md p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Update Order Status
            </h3>
            {selectedOrder && (
              <p className="text-xs font-mono text-gray-500 mt-1">
                Editing status for Order: {selectedOrder._id || selectedOrder.id}
              </p>
            )}
          </div>

          <form onSubmit={handleUpdateStatus} className="space-y-5">
            <div>
              <Label htmlFor="orderStatusSelect">Select New Status</Label>
              <select
                id="orderStatusSelect"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 shadow-theme-xs"
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updating}
                size="sm"
              >
                {updating ? 'Saving...' : 'Update Status'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrders;
