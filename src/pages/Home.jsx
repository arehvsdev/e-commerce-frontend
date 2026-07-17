import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../redux/thunks/productThunks';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, totalPages } = useSelector((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const querySearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(querySearch);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);

  const fetchProductsList = async (pageNum = page, currentSearch = search) => {
    const params = { page: pageNum, limit: 8 };
    if (currentSearch.trim()) params.search = currentSearch;
    if (category) params.category = category;
    if (sort) params.sort = sort;

    try {
      const resultAction = await dispatch(fetchProducts(params));
      if (fetchProducts.rejected.match(resultAction)) {
        toast.error(resultAction.payload || 'Failed to fetch products');
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch when category or sort changes
  useEffect(() => {
    fetchProductsList(1, search);
    setPage(1);
  }, [category, sort]);

  // Handle URL query changes (e.g. from header search)
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearch(q);
    fetchProductsList(1, q);
    setPage(1);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search.trim() ? { search: search.trim() } : {});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchProductsList(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6" id="home-page">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Product Catalog
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover and order top quality products.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex w-full sm:w-80">
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-r-none border-r-0"
            />
            <Button
              type="submit"
              size="sm"
              className="rounded-l-none whitespace-nowrap px-4 py-2.5 h-11"
            >
              Search
            </Button>
          </form>

          {/* Category Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 w-full sm:w-48 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none shadow-theme-xs cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => {
                const catName = typeof cat === 'string' ? cat : cat.name;
                const catId = typeof cat === 'string' ? cat : cat._id;
                return (
                  <option key={catId} value={catName}>
                    {catName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sorting */}
          <div className="w-full sm:w-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 w-full sm:w-48 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none shadow-theme-xs cursor-pointer"
            >
              <option value="">Sort By</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Highest Rated</option>
              <option value="-createdAt">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-theme-xs">
          <p className="text-gray-500 text-lg font-medium">No products found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8 pt-4 border-t border-gray-100">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="px-4 py-2"
              >
                Previous
              </Button>
              <span className="text-sm font-semibold text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
                className="px-4 py-2"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;