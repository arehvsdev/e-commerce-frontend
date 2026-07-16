import React from "react";

// Table Component
const Table = ({ children, className = "" }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

// TableHeader Component
const TableHeader = ({ children, className = "" }) => {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
};

// TableBody Component
const TableBody = ({ children, className = "" }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

// TableRow Component
const TableRow = ({ children, className = "" }) => {
  return <tr className={className}>{children}</tr>;
};

// TableCell Component
const TableCell = ({
  children,
  isHeader = false,
  className = "",
  align = "left",
}) => {
  const CellTag = isHeader ? "th" : "td";
  
  let baseClasses = isHeader
    ? "px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"
    : "px-6 py-4 whitespace-nowrap text-sm text-gray-800";

  if (align === "right") {
    baseClasses += " text-right";
  } else if (align === "center") {
    baseClasses += " text-center";
  } else {
    baseClasses += " text-left";
  }

  return (
    <CellTag className={`${baseClasses} ${className}`}>
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
