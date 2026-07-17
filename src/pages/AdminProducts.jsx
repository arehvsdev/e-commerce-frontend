import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Pencil, Trash2, Plus } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals visibility
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editProductId, setEditProductId] = useState(null);
  
  // Product form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [rating, setRating] = useState('4.0');
  const [sku, setSku] = useState('');

  // Categories list and inline category creation states
  const [categoriesList, setCategoriesList] = useState([]);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Custom delete popup states
  const [deleteProductId, setDeleteProductId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      const data = response.data.data;
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategoriesList(response.data.data || []);
    } catch (error) {
      console.warn('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAddForm = () => {
    setEditProductId(null);
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setStock('');
    setImage('');
    setRating('4.0');
    setSku('');
    setShowNewCatInput(false);
    setNewCatName('');
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditProductId(product._id || product.id);
    setName(product.name || '');
    setDescription(product.description || '');
    setCategory(product.category || '');
    setPrice(product.price ? product.price.toString() : '');
    setStock(product.stock ? product.stock.toString() : '0');
    setImage(product.image || '');
    setRating(product.rating ? product.rating.toString() : '4.0');
    setSku(product.sku || '');
    setShowNewCatInput(false);
    setNewCatName('');
    setShowForm(true);
  };

  const openDeleteConfirm = (productId) => {
    setDeleteProductId(productId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteProductId) return;
    try {
      await api.delete(`/products/${deleteProductId}`);
      toast.success('Product deleted successfully!');
      setShowDeleteConfirm(false);
      setDeleteProductId(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Create new category inline
  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) {
      return toast.error('Category name cannot be empty');
    }
    if (newCatName.trim().length < 2 || newCatName.trim().length > 60) {
      return toast.error('Category name must be between 2 and 60 characters');
    }
    try {
      const res = await api.post('/categories', { name: newCatName.trim() });
      const created = res.data.data;
      toast.success('Category created successfully!');
      await fetchCategories();
      setCategory(created.name);
      setNewCatName('');
      setShowNewCatInput(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !category.trim() || !price || stock === '' || !image.trim()) {
      return toast.error('Please enter all required fields');
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return toast.error('Product name must be between 2 and 100 characters');
    }

    if (description.trim().length < 5 || description.trim().length > 1000) {
      return toast.error('Description must be between 5 and 1000 characters');
    }

    if (category.trim().length < 2 || category.trim().length > 60) {
      return toast.error('Category must be between 2 and 60 characters');
    }

    if (sku && sku.trim() !== "") {
      if (sku.trim().length < 2 || sku.trim().length > 50) {
        return toast.error('SKU must be between 2 and 50 characters');
      }
    }

    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) {
      return toast.error('Price must be greater than 0');
    }

    const s = Number(stock);
    if (isNaN(s) || !Number.isInteger(s) || s < 0) {
      return toast.error('Stock must be an integer 0 or greater');
    }

    const r = parseFloat(rating);
    if (isNaN(r) || r < 0 || r > 5) {
      return toast.error('Rating must be between 0 and 5');
    }

    if (image.trim().length > 500) {
      return toast.error('Image URL must be 500 characters or fewer');
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      price: p,
      stock: s,
      image: image.trim(),
      rating: r,
      sku: sku.trim() || undefined,
    };

    try {
      if (editProductId) {
        await api.put(`/products/${editProductId}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6" id="admin-products-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Manage Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit, and delete catalog products.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={openAddForm}
            startIcon={<Plus className="w-4 h-4" />}
            size="sm"
            className="w-full sm:w-auto justify-center"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-theme-xs overflow-hidden">
        {products.length === 0 ? (
          <p className="p-12 text-center text-gray-500 font-medium">No products available. Add one above.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Product Info</TableCell>
                <TableCell isHeader>SKU</TableCell>
                <TableCell isHeader>Category</TableCell>
                <TableCell isHeader>Price</TableCell>
                <TableCell isHeader>Stock</TableCell>
                <TableCell isHeader align="right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const productId = product._id || product.id;
                return (
                  <TableRow key={productId} id={`admin-product-row-${productId}`}>
                    {/* Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-150 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-400">No Image</span>
                          )}
                        </div>
                        <div className="truncate max-w-[150px] sm:max-w-xs font-semibold text-gray-850">
                          {product.name}
                        </div>
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell className="font-mono text-xs text-gray-600">
                      {product.sku || 'N/A'}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="text-gray-500 font-medium">
                      {product.category}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-bold text-gray-950">
                      ₹{product.price?.toFixed(2)}
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="font-semibold text-gray-850">
                      {product.stock}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className="text-gray-400 hover:text-brand-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                          title="Edit Product"
                        >
                          <Pencil className="size-5" />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(productId)}
                          className="text-gray-400 hover:text-error-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 focus:outline-none"
                          title="Delete Product"
                        >
                          <Trash2 className="size-5" />
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
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        className="max-w-2xl p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {editProductId ? 'Edit Product Details' : 'Add New Product'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {editProductId ? `Editing product ID: ${editProductId}` : 'Fill in the information to list a new catalog product.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <Label htmlFor="prodName">Product Name *</Label>
                <Input
                  id="prodName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Headset"
                  required
                />
              </div>

              {/* SKU */}
              <div>
                <Label htmlFor="prodSku">SKU (Stock Keeping Unit)</Label>
                <Input
                  id="prodSku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. ELEC-HEAD-001"
                />
              </div>

              {/* Category Dropdown and option to add */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <Label htmlFor="prodCategory" className="mb-0">Category *</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCatName('');
                      setShowNewCatInput(!showNewCatInput);
                    }}
                    className="text-xs font-semibold text-brand-650 hover:text-brand-700 focus:outline-none"
                  >
                    {showNewCatInput ? 'Cancel Add' : '+ Add New Category'}
                  </button>
                </div>
                
                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Enter new category name"
                      className="grow"
                    />
                    <Button
                      type="button"
                      onClick={handleAddNewCategory}
                      size="sm"
                      className="whitespace-nowrap px-4 py-2.5 h-11"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <select
                    id="prodCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none shadow-theme-xs cursor-pointer"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id || cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="prodPrice">Price (₹) *</Label>
                <Input
                  id="prodPrice"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Stock */}
              <div>
                <Label htmlFor="prodStock">Stock Quantity *</Label>
                <Input
                  id="prodStock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <Label htmlFor="prodImage">Image URL *</Label>
                <Input
                  id="prodImage"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <Label htmlFor="prodDesc">Description *</Label>
                <textarea
                  id="prodDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 bg-transparent text-gray-800 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 shadow-theme-xs"
                  placeholder="Provide a detailed description of the product."
                  required
                ></textarea>
              </div>

              {/* Rating */}
              <div>
                <Label htmlFor="prodRating">Initial Rating (0 - 5)</Label>
                <Input
                  id="prodRating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>
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
                {editProductId ? 'Update Product' : 'Create Product'}
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
            <Trash2 className="size-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Delete Product</h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to delete this product? This action cannot be undone.
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

export default AdminProducts;
