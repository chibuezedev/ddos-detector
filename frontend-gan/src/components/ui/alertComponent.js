
import React from "react";
import { AlertTriangle } from "lucide-react";

export const Alert = ({ children, variant = "info", className = "" }) => {
  const variantStyles = {
    info: "bg-blue-100 border-blue-400 text-blue-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 border rounded-md ${variantStyles[variant]} ${className}`}
    >
      {variant === "error" && (
        <AlertTriangle className="w-5 h-5 text-red-500" />
      )}
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold ${className}`}>{children}</h3>
);

export const AlertDescription = ({ children, className = "" }) => (
  <p className={`text-sm ${className}`}>{children}</p>
);
