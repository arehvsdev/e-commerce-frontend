import React from "react";
import { Link } from "react-router-dom";

const GridShape = () => {
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
        <img src="/images/shape/grid-01.svg" alt="grid" />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
        <img src="/images/shape/grid-01.svg" alt="grid" />
      </div>
    </>
  );
};

export default function AuthLayout({ children }) {
  return (
    <div className="relative p-6 bg-white z-1 sm:p-0 min-h-screen">
      <div className="relative flex flex-col lg:flex-row justify-center w-full min-h-screen sm:p-0">
        {/* Form container */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-1/2">
          {children}
        </div>
        
        {/* Brand Side Panel */}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 lg:grid relative min-h-screen">
          <div className="relative flex flex-col items-center justify-center z-1 w-full text-center p-8">
            <GridShape />
            <div className="flex flex-col items-center max-w-sm">
              <Link to="/" className="block mb-6 text-white text-4xl font-extrabold tracking-widest hover:text-brand-300 transition-colors">
                E-SHOP
              </Link>
              <p className="text-center text-gray-400 font-medium">
                Experience premium shopping powered by our Tailwind CSS Admin Dashboard design system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
