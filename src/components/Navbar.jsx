import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { FaShoppingCart, FaUser, FaBox, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { token, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-md" id="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600 tracking-wide">
              E-SHOP
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
              Home
            </Link>

            <Link to="/cart" className="relative flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
              <FaShoppingCart className="mr-1" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {token ? (
              <>
                <Link to="/orders" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                  <FaBox className="mr-1" />
                  <span>Orders</span>
                </Link>
                
                <Link to="/profile" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                  <FaUser className="mr-1" />
                  <span>Profile</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link to="/admin/products" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium border border-blue-500 rounded">
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 rounded-md font-medium cursor-pointer"
                >
                  <FaSignOutAlt className="mr-1" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;