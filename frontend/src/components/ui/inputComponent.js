
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  size = "lg",
  disabled = false,
}) => {
  const baseStyles =
    "border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200";

  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-16 py-2 text-lg",
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={clsx(baseStyles, sizeStyles[size], {
        "bg-gray-100 text-gray-500 cursor-not-allowed": disabled,
        "bg-white text-gray-700": !disabled,
      })}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
};

export default Input;
