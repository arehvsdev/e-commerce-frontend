import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { Dropdown } from "./ui/Dropdown";
import { DropdownItem } from "./ui/DropdownItem";
import { UserCircleIcon, BoxIcon, CalenderIcon, PlugInIcon } from "../icons";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = () => {
    closeDropdown();
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
  };

  if (!token) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition"
      >
        <PlugInIcon className="size-4 fill-current" />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle focus:outline-none cursor-pointer"
      >
        <span className="mr-3 overflow-hidden rounded-full h-10 w-10 border border-gray-200 flex items-center justify-center bg-gray-50">
          <svg className="size-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </span>

        <span className="block mr-1 font-medium text-theme-sm text-gray-800">
          {user?.name || "User"}
        </span>
        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg"
      >
        <div className="px-3 py-2 border-b border-gray-100">
          <span className="block font-semibold text-gray-800 text-theme-sm truncate">
            {user?.name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 truncate">
            {user?.email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-3 border-b border-gray-200">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-900"
            >
              <UserCircleIcon className="size-5 text-gray-500" />
              My Profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/orders"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-900"
            >
              <CalenderIcon className="size-5 text-gray-500" />
              Order History
            </DropdownItem>
          </li>

          {user?.role === "admin" && (
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                to="/admin/products"
                className="flex items-center gap-3 px-3 py-2 font-medium text-brand-650 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-brand-700"
              >
                <BoxIcon className="size-5 text-brand-500" />
                Manage Products
              </DropdownItem>
            </li>
          )}
        </ul>

        <div className="pt-2">
          <DropdownItem
            onClick={handleLogout}
            tag="button"
            className="flex items-center gap-3 w-full px-3 py-2 font-bold text-error-600 rounded-lg group text-theme-sm hover:bg-error-50 hover:text-error-700 transition"
          >
            <svg
              className="size-5 text-error-500 group-hover:text-error-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
