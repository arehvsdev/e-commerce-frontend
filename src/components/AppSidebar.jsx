import React, { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  BoxCubeIcon,
  TableIcon,
  UserCircleIcon,
  BoxIcon,
  PlugInIcon,
  PlusIcon,
  HorizontaLDots,
} from "../icons";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const isAdmin = token && user?.role === "admin";

  // Customer Navigation Items (only visible to normal users / guests)
  const mainNavItems = [];
  if (!isAdmin) {
    mainNavItems.push(
      {
        icon: <GridIcon />,
        name: "Shop Catalog",
        path: "/",
      },
      {
        icon: <BoxCubeIcon />,
        name: "My Cart",
        path: "/cart",
      }
    );

    if (token) {
      mainNavItems.push(
        {
          icon: <TableIcon />,
          name: "My Orders",
          path: "/orders",
        },
        {
          icon: <UserCircleIcon />,
          name: "My Profile",
          path: "/profile",
        }
      );
    }
  }

  // Admin Panel Navigation Items (only visible to admin users)
  const adminNavItems = [];
  if (isAdmin) {
    adminNavItems.push(
      {
        icon: <GridIcon />,
        name: "Ecommerce Dashboard",
        path: "/admin/dashboard",
      },
      {
        icon: <BoxIcon />,
        name: "Manage Products",
        path: "/admin/products",
      },
      {
        icon: <TableIcon />,
        name: "Manage Categories",
        path: "/admin/categories",
      },
      {
        icon: <UserCircleIcon />,
        name: "Manage Users",
        path: "/admin/users",
      },
      {
        icon: <TableIcon />,
        name: "Manage Orders",
        path: "/admin/orders",
      }
    );
  }

  // Guest Navigation Items
  const guestNavItems = [];
  if (!token) {
    guestNavItems.push(
      {
        icon: <PlugInIcon />,
        name: "Sign In",
        path: "/login",
      },
      {
        icon: <PlusIcon className="w-3.5 h-3.5" />,
        name: "Sign Up",
        path: "/register",
      }
    );
  }

  const renderMenuItems = (items) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav) => (
        <li key={nav.name}>
          <Link
            to={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            } ${
              !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
            }`}
          >
            <span
              className={`menu-item-icon-size ${
                isActive(nav.path)
                  ? "menu-item-icon-active text-brand-500"
                  : "menu-item-icon-inactive text-gray-500 group-hover:text-gray-700"
              }`}
            >
              {nav.icon}
            </span>
            {(isExpanded || isHovered || isMobileOpen) && (
              <span className="menu-item-text">{nav.name}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-2xl font-extrabold tracking-widest text-brand-600">
              E-SHOP
            </span>
          ) : (
            <span className="text-xl font-extrabold tracking-wider text-brand-600 bg-brand-50 px-2 py-1 rounded">
              ES
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar grow">
        <nav className="mb-6 grow">
          <div className="flex flex-col gap-4">
            
            {/* Customer Main Menu Items (Rendered without MENU text header) */}
            {mainNavItems.length > 0 && (
              <div>
                {renderMenuItems(mainNavItems)}
              </div>
            )}

            {/* Admin Panel (Only shown if user is admin) */}
            {adminNavItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 font-semibold ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Admin Panel"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(adminNavItems)}
              </div>
            )}

            {/* Account (Guests only) */}
            {guestNavItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 font-semibold ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Account"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(guestNavItems)}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
