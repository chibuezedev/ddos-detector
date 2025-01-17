/* eslint-disable jsx-a11y/heading-has-content */

import React, { useState, useRef, useEffect } from "react";

const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200">
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-background rounded-lg shadow-lg p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDialogHeader = ({ className, ...props }) => {
  return <div className={`space-y-2 ${className}`} {...props} />;
};

const AlertDialogFooter = ({ className, ...props }) => {
  return (
    <div
      className={`flex justify-end space-x-2 mt-6 ${className}`}
      {...props}
    />
  );
};

const AlertDialogTitle = ({ className, ...props }) => {
  return <h2 className={`text-lg font-semibold ${className}`} {...props} />;
};

const AlertDialogDescription = ({ className, ...props }) => {
  return <p className={`text-sm text-gray-500 ${className}`} {...props} />;
};

const AlertDialogAction = ({ className, children, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Label = ({ className, ...props }) => {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  );
};

const Switch = ({ checked, onCheckedChange, className, ...props }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none 
        ${checked ? "bg-primary" : "bg-gray-200"}
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg 
          ring-0 transition duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
};

const Button = ({ className, children, ...props }) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50
        disabled:pointer-events-none ring-offset-background
        bg-primary text-primary-foreground hover:bg-primary/90
        h-10 px-4 py-2
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = React.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
        flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
        ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
        placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isOpen,
        setIsOpen,
        value,
        onValueChange,
        selectProps: {
          value,
          onValueChange,
          setIsOpen,
        },
      });
    }
    return child;
  });

  return (
    <div className="relative bg-white hover:bg-gray-50">
      {childrenWithProps}
    </div>
  );
};

const SelectTrigger = ({
  className,
  children,
  isOpen,
  setIsOpen,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`
          flex h-10 w-full items-center justify-between rounded-md border border-input
          bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed
          disabled:opacity-50
          ${className}
        `}
      {...props}
    >
      {children}
      <span
        className={`ml-2 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        ▼
      </span>
    </button>
  );
};

const SelectContent = ({
  className,
  children,
  isOpen,
  setIsOpen,
  selectProps,
  ...props
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  if (!isOpen) return null;

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { selectProps });
    }
    return child;
  });

  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg ${className}`}
      {...props}
    >
      <div className="p-1">{childrenWithProps}</div>
    </div>
  );
};

const SelectItem = ({ className, children, value, selectProps, ...props }) => {
  if (!selectProps) return null;

  const { onValueChange, setIsOpen } = selectProps;

  return (
    <button
      type="button"
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center py-1.5 px-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const SelectValue = ({ value, placeholder }) => {
  return <span className="block truncate">{value || placeholder}</span>;
};

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Label,
  Switch,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};
