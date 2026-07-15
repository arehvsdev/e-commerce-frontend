import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6" id="footer">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} E-SHOP. All rights reserved. E-Commerce Student Assignment Project.
      </div>
    </footer>
  );
};

export default Footer;