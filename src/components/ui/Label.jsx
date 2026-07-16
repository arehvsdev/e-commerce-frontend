import React from "react";

const Label = ({ htmlFor, children, className = "" }) => {
  const combinedClasses = `mb-1.5 block text-sm font-medium text-gray-700 ${className}`.trim();
  return (
    <label htmlFor={htmlFor} className={combinedClasses}>
      {children}
    </label>
  );
};

export default Label;
