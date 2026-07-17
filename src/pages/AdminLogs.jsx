import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Terminal, Search, Eye, RefreshCw } from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');

  // Details modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async (pageNum = page) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (method) params.method = method;
      if (status) params.status = status;

      const response = await api.get('/user/logs', { params });
      const data = response.data.data;
      setLogs(data.logs || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch API logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [method, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchLogs(newPage);
    }
  };

  const openLogDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const getMethodBadgeColor = (method) => {
    switch (method?.toUpperCase()) {
      case 'POST':
        return 'success';
      case 'PUT':
        return 'info';
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeColor = (code) => {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 300 && code < 400) return 'info';
    if (code >= 400 && code < 500) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6" id="admin-logs-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-2">
            <Terminal className="size-8 text-brand-600" />
            API Activity Logs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Audit trailing of write operations (POST, PUT, PATCH, DELETE). Logs auto-delete after 7 days.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} className="h-11 flex items-center gap-1.5">
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {/* Filters Form */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-theme-xs flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto grow">
          <div className="relative w-full">
            <span className="absolute -translate-y-1/2 left-4 top-1/2 text-gray-400">
              <Search className="size-4" />
            </span>
            <Input
              type="text"
              placeholder="Search endpoints (e.g. /api/products)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Method Selector */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:border-brand-300 focus:outline-none shadow-theme-xs cursor-pointer"
          >
            <option value="">All Methods</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          {/* Status Code Selector */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none shadow-theme-xs cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="200">200 OK</option>
            <option value="201">201 Created</option>
            <option value="400">400 Bad Request</option>
            <option value="401">401 Unauthorized</option>
            <option value="403">403 Forbidden</option>
            <option value="404">404 Not Found</option>
            <option value="500">500 Server Error</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : logs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-theme-xs">
          <Terminal className="size-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No activity logs recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Timestamp</TableCell>
                  <TableCell isHeader>Method</TableCell>
                  <TableCell isHeader>Endpoint Path</TableCell>
                  <TableCell isHeader>User</TableCell>
                  <TableCell isHeader>Response Status</TableCell>
                  <TableCell isHeader>Duration</TableCell>
                  <TableCell isHeader align="right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const userDetail = log.userId;
                  const userName = userDetail ? `${userDetail.firstName || ''} ${userDetail.lastName || ''}`.trim() : 'Guest';
                  const userEmail = userDetail?.email ? `(${userDetail.email})` : '';
                  const userDisplay = userDetail ? `${userName} ${userEmail}` : 'Guest / Unauthorized';

                  return (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-xs text-gray-550 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getMethodBadgeColor(log.method)}>
                          {log.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-gray-800 break-all max-w-[200px] sm:max-w-xs md:max-w-md">
                        {log.path}
                      </TableCell>
                      <TableCell className="text-xs text-gray-700 whitespace-nowrap">
                        {userDisplay}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeColor(log.statusCode)}>
                          {log.statusCode || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {log.responseTimeMs != null ? `${log.responseTimeMs}ms` : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <button
                          onClick={() => openLogDetails(log)}
                          className="text-gray-400 hover:text-brand-500 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                          title="View Details"
                        >
                          <Eye className="size-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-150 bg-gray-50">
              <span className="text-xs text-gray-500">
                Showing page {page} of {totalPages} ({total} logs total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl p-6">
        {selectedLog && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Terminal className="size-5 text-brand-500" />
                API Log Details
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Diagnostic request meta and body payload.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 space-y-1">
                <span className="text-gray-400 font-medium">Request Route</span>
                <p className="font-mono font-semibold text-gray-900 break-all">{selectedLog.path}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 space-y-1">
                <span className="text-gray-400 font-medium">Timestamp</span>
                <p className="font-semibold text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 space-y-1">
                <span className="text-gray-400 font-medium">IP Address / Client</span>
                <p className="font-mono font-semibold text-gray-900">{selectedLog.ip || 'Unknown'}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 space-y-1">
                <span className="text-gray-400 font-medium">User Agent</span>
                <p className="font-semibold text-gray-950 truncate" title={selectedLog.userAgent}>{selectedLog.userAgent || 'Unknown'}</p>
              </div>
            </div>

            {/* Request Payload / Body */}
            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-semibold">Request Body (POST/PUT/PATCH/DELETE payload)</span>
              <div className="bg-gray-900 text-gray-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-60 border border-gray-850">
                {selectedLog.requestBody ? (
                  <pre>{JSON.stringify(selectedLog.requestBody, null, 2)}</pre>
                ) : (
                  <span className="text-gray-500 italic">No request payload</span>
                )}
              </div>
            </div>

            {/* Query parameters */}
            {selectedLog.query && Object.keys(selectedLog.query).length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-gray-500 font-semibold">Query Parameters</span>
                <div className="bg-gray-550/10 text-gray-700 p-3 rounded-xl font-mono text-xs overflow-x-auto border border-gray-200">
                  <pre>{JSON.stringify(selectedLog.query, null, 2)}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button size="sm" onClick={() => setIsModalOpen(false)}>
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminLogs;
