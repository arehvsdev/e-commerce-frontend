import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import Badge from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartPoints, setChartPoints] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          api.get('/orders/admin'),
          api.get('/user'),
          api.get('/products'),
        ]);

        const allOrders = ordersRes.data.data?.orders || [];
        const allUsers = usersRes.data.data?.users || usersRes.data.data || [];
        const allProducts = productsRes.data.data?.products || [];

        const totalSales = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        setMetrics({
          totalSales,
          totalOrders: allOrders.length,
          totalUsers: allUsers.length,
          totalProducts: allProducts.length,
        });

        // Group sales by bi-monthly periods: Jan/Feb, Mar/Apr, May/Jun, Jul/Aug, Sep/Oct, Nov/Dec
        const periodTotals = Array(6).fill(0);
        allOrders.forEach(order => {
          if (order.createdAt) {
            const date = new Date(order.createdAt);
            const month = date.getMonth(); // 0-11
            const period = Math.floor(month / 2); // 0-5
            periodTotals[period] += (order.totalAmount || 0);
          }
        });

        const maxVal = Math.max(...periodTotals, 1);
        const pts = periodTotals.map((val, idx) => {
          const xList = [10, 100, 190, 280, 370, 450];
          const x = xList[idx];
          const y = 180 - (val / maxVal) * 140; // Scale dynamically within SVG container
          return { x, y, value: val };
        });
        setChartPoints(pts);

        // Set the latest 5 orders as recent orders
        const sortedOrders = [...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard analytics', err);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'pending':
      default: return 'warning';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6" id="admin-dashboard-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Ecommerce Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time metrics, sales trends, and order tracking.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        
        {/* Metric 1: Total Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl text-brand-500">
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 font-medium">Total Revenue</span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl">
                ₹{metrics.totalSales.toFixed(2)}
              </h4>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl text-blue-500">
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 font-medium">Orders Placed</span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl">
                {metrics.totalOrders}
              </h4>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Users */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs">
          <div className="flex items-center justify-center w-12 h-12 bg-success-50 rounded-xl text-success-500">
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 font-medium">Registered Users</span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl">
                {metrics.totalUsers}
              </h4>
            </div>
          </div>
        </div>

        {/* Metric 4: Total Products */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-theme-xs">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl text-orange-500">
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 font-medium">Products Catalog</span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl">
                {metrics.totalProducts}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Target */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Sales trend chart (col 8) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue & Sales Trends</h3>
              <p className="text-xs text-gray-500 mt-0.5">Monthly store performance overview</p>
            </div>
          </div>
          {/* Custom SVG Line Chart */}
          <div className="w-full h-64 flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" />
              
              {/* SVG Area under line */}
              {chartPoints.length > 0 && (
                <path
                  d={`M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${chartPoints[chartPoints.length - 1].x} 200 L ${chartPoints[0].x} 200 Z`}
                  fill="url(#salesGrad)"
                  opacity="0.15"
                />
              )}
              {/* SVG Trend Line */}
              {chartPoints.length > 0 && (
                <path
                  d={`M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}
              
              {/* Data points */}
              {chartPoints.map((pt, idx) => (
                <circle key={idx} cx={pt.x} cy={pt.y} r="4.5" fill="#4f46e5" stroke="white" strokeWidth="1.5" />
              ))}
              
              {/* Gradients */}
              <defs>
                <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-bold uppercase tracking-wider px-2 pt-3 border-t border-gray-100">
            <span>Jan/Feb</span>
            <span>Mar/Apr</span>
            <span>May/Jun</span>
            <span>Jul/Aug</span>
            <span>Sep/Oct</span>
            <span>Nov/Dec</span>
          </div>
        </div>

        {/* Monthly Target (col 4) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Monthly Sales Goal</h3>
            <p className="text-xs text-gray-500 mt-0.5">Progress toward monthly quota</p>
          </div>
          
          <div className="relative flex items-center justify-center py-6">
            {/* Visual Gauge */}
            <div className="w-36 h-36 rounded-full border-[10px] border-gray-100 flex flex-col items-center justify-center relative">
              <span className="text-3xl font-black text-gray-900">
                {Math.min(Math.round((metrics.totalSales / 10000) * 100), 100)}%
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Reached</span>
              <div className="absolute inset-0 rounded-full border-[10px] border-brand-500 border-t-transparent border-r-transparent rotate-45"></div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Target Revenue</span>
              <span className="font-bold text-gray-800">₹10,000.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Current Revenue</span>
              <span className="font-bold text-brand-600">₹{metrics.totalSales.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-theme-xs space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Purchases</h3>
            <p className="text-xs text-gray-500 mt-0.5">Overview of the latest store transactions</p>
          </div>
          <Link to="/admin/orders">
            <button className="text-xs font-bold text-brand-500 hover:text-brand-600 hover:underline">
              See all orders &rarr;
            </button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-6 font-medium">No recent orders found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Order ID</TableCell>
                <TableCell isHeader>Placed On</TableCell>
                <TableCell isHeader>Product Info</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => {
                const orderId = order._id || order.id;
                return (
                  <TableRow key={orderId}>
                    <TableCell className="font-mono text-xs font-bold text-gray-500">
                      {orderId}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-150 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {order.product?.image ? (
                            <img src={order.product.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-400">No Image</span>
                          )}
                        </div>
                        <div className="truncate max-w-xs font-semibold text-gray-850">
                          {order.product?.name || 'Product Deleted'}
                          <span className="text-xs font-normal text-gray-500 block mt-0.5">Qty: {order.quantity}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      ₹{(order.totalAmount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge color={getStatusColor(order.status)} variant="light">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
