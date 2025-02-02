import React from "react";
import PropTypes from 'prop-types';
import clsx from 'clsx';


export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`text-gray-700 ${className}`}>{children}</div>
);


export const CardFooter = ({ children, className }) => {
  return (
    <div className={clsx('px-4 py-3 border-t border-gray-200 flex items-center justify-end space-x-2', className)}>
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};


