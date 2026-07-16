import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { PencilIcon, TrashBinIcon, PlusIcon } from '../icons';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom delete popup states
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [role, setRole] = useState('user');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user');
      const data = response.data.data?.users || response.data.data || [];
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedUserId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('user');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setSelectedUserId(user._id || user.id);
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setPassword('');
    setRole(user.role || 'user');
    setShowModal(true);
  };

  const openDeleteConfirm = (userId, userName) => {
    setDeleteUserId(userId);
    setDeleteUserName(userName);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;
    try {
      await api.delete(`/user/${deleteUserId}`);
      toast.success('User deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
      setDeleteUserName('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      return toast.error('Name, Email and Phone are required');
    }

    try {
      if (modalMode === 'add') {
        if (!password) return toast.error('Password is required for new users');
        await api.post('/user', { name, email, phone, password, role });
        toast.success('User created successfully');
      } else {
        await api.put(`/user/${selectedUserId}`, { name, email, phone });
        toast.success('User details updated successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6" id="admin-users-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View, create, and manage registered store accounts.
          </p>
        </div>
        <div>
          <Button
            onClick={openAddModal}
            startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-xs overflow-hidden">
        {users.length === 0 ? (
          <p className="p-12 text-center text-gray-500 font-medium">No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Email</TableCell>
                <TableCell isHeader>Phone</TableCell>
                <TableCell isHeader>Role</TableCell>
                <TableCell isHeader align="right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userId = user._id || user.id;
                return (
                  <TableRow key={userId}>
                    {/* Name */}
                    <TableCell className="font-semibold text-gray-950">
                      {user.name}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-gray-600 font-medium">
                      {user.email}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="text-gray-600 font-medium">
                      {user.phone || 'N/A'}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge color={user.role === 'admin' ? 'primary' : 'light'} variant="solid">
                        {user.role || 'user'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-gray-400 hover:text-brand-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                          title="Edit Details"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(userId, user.name)}
                          className="text-gray-400 hover:text-error-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                          title="Delete User"
                        >
                          <TrashBinIcon className="size-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal Form for Add / Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        className="max-w-2xl p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {modalMode === 'add' ? 'Create New User Account' : 'Edit User Information'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {modalMode === 'add' 
                ? 'Fill in the information below to register a new user or administrator account.' 
                : 'Modify the email, phone, or name of this registered user.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <Label htmlFor="usrName">Full Name *</Label>
                <Input
                  id="usrName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <Label htmlFor="usrEmail">Email Address *</Label>
                <Input
                  id="usrEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="usrPhone">Phone Number *</Label>
                <Input
                  id="usrPhone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1234567890"
                  required
                />
              </div>

              {/* Password (for new user only) */}
              {modalMode === 'add' && (
                <div>
                  <Label htmlFor="usrPassword">Password *</Label>
                  <Input
                    id="usrPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters, letters & digits"
                    required
                  />
                </div>
              )}

              {/* Role (for new user only) */}
              {modalMode === 'add' && (
                <div>
                  <Label htmlFor="usrRole">Role</Label>
                  <select
                    id="usrRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 shadow-theme-xs"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
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
                size="sm"
              >
                {modalMode === 'add' ? 'Create User' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        className="max-w-md p-6"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mx-auto text-error-600 mb-4">
            <TrashBinIcon className="size-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete user <span className="font-semibold text-gray-800">&quot;{deleteUserName}&quot;</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="w-1/2 justify-center"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="w-1/2 justify-center"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
