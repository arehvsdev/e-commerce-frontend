import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import Footer from "./Footer";

const LayoutContent = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen lg:flex bg-gray-50 text-gray-800">
      <AppSidebar />
      <Backdrop />
      
      <div
        className={`flex-grow flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        
        <main className="flex-grow p-4 md:p-6 mx-auto w-full max-w-[2000px]">
          {children || <Outlet />}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
