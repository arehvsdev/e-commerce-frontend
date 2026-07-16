import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { TrashBinIcon, PlusIcon, PencilIcon } from '../icons';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState(null);

  // Delete modal states
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddForm = () => {
    setEditCategoryId(null);
    setName('');
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditCategoryId(category._id || category.id);
    setName(category.name || '');
    setShowForm(true);
  };

  const openDeleteConfirm = (categoryId, categoryName) => {
    setDeleteCategoryId(categoryId);
    setDeleteCategoryName(categoryName);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await api.delete(`/categories/${deleteCategoryId}`);
      toast.success('Category deleted successfully!');
      setShowDeleteConfirm(false);
      setDeleteCategoryId(null);
      setDeleteCategoryName('');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error('Category name is required');
    }

    try {
      if (editCategoryId) {
        await api.put(`/categories/${editCategoryId}`, { name: name.trim() });
        toast.success('Category updated successfully!');
      } else {
        await api.post('/categories', { name: name.trim() });
        toast.success('Category created successfully!');
      }
      setShowForm(false);
      setEditCategoryId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6" id="admin-categories-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Manage Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and delete product catalog categories.
          </p>
        </div>
        <div>
          <Button
            onClick={openAddForm}
            startIcon={<PlusIcon className="w-4 h-4 fill-current" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-xs overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-12 text-center text-gray-500 font-medium">No categories available. Add one above.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Category Name</TableCell>
                <TableCell isHeader>Created At</TableCell>
                <TableCell isHeader align="right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const categoryId = category._id || category.id;
                return (
                  <TableRow key={categoryId}>
                    {/* Category Name */}
                    <TableCell className="font-semibold text-gray-855">
                      {category.name}
                    </TableCell>
 
                    {/* Created Date */}
                    <TableCell className="text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
 
                    {/* Actions */}
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(category)}
                          className="text-gray-400 hover:text-brand-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                          title="Edit Category"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(categoryId, category.name)}
                          className="text-gray-400 hover:text-error-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                          title="Delete Category"
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

      {/* Modal Form for Add/Edit Category */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        className="max-w-md p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {editCategoryId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {editCategoryId ? 'Modify the category name.' : 'Specify a name for the new product category.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="catName">Category Name *</Label>
              <Input
                id="catName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home Appliances"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
              >
                {editCategoryId ? 'Save Changes' : 'Create Category'}
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
            <h3 className="text-xl font-bold text-gray-900">Delete Category</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete category <span className="font-semibold text-gray-800">&quot;{deleteCategoryName}&quot;</span>? This action cannot be undone.
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

export default AdminCategories;
