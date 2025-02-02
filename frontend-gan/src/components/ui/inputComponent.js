import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const Input = React.forwardRef(({
  type = "text",
  placeholder,
  value,
  onChange,
  size = "lg",
  disabled = false,
  id,
  name,
  required,
  className,
  ...props  // Add this to accept any additional props
}, ref) => {
  const baseStyles =
    "border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 w-full";

  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-2 text-lg", // Changed from px-16 to px-4 for better spacing
  };

  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={clsx(
        baseStyles, 
        sizeStyles[size], 
        className,
        {
          "bg-gray-100 text-gray-500 cursor-not-allowed": disabled,
          "bg-white text-gray-700": !disabled,
        }
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;