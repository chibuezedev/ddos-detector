import React, { useState, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/buttonComponent";

import { Shield, LogOut, Menu, X } from "lucide-react";

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="font-bold text-xl">NetGuard</span>
            </Link>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user.username}</span>
              <Button
                variant="ghost"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
