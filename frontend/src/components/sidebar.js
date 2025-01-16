import React from "react";
import { Shield, Activity, Target  } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="hidden md:block w-64 bg-gray-50 border-r h-screen fixed">
      <div className="p-4">
        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <Activity className="h-5 w-5 text-gray-600" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/analyze"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <Target className="h-5 w-5 text-gray-600" />
            <span>Analyse</span>
          </Link>
          <Link
            to="#"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <Shield className="h-5 w-5 text-gray-600" />
            <span>Security Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
