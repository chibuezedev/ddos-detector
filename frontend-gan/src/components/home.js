import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowRight, Lock, Activity, Bell } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className="w-12 h-12 mb-4 rounded-lg bg-blue-50 flex items-center justify-center">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Hero = () => {
  const features = [
    {
      icon: Lock,
      title: "Real-time Protection",
      description: "Continuous monitoring and instant threat detection to keep your network secure"
    },
    {
      icon: Activity,
      title: "Smart Analytics",
      description: "Advanced AI-powered analysis to identify and prevent potential security breaches"
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Get immediate notifications about suspicious activities and threats"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="px-4 py-5 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <Shield className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Detective
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
              Login
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="px-4 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="animate-fade-in">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Secure Your Network with
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Intelligent Protection
              </span>
            </h1>
          </div>
          
          <p className="max-w-2xl mb-8 text-xl text-gray-600 animate-fade-in-delay-1">
            Advanced intrusion detection powered by AI that helps you monitor, detect, 
            and respond to potential security threats in real-time.
          </p>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 animate-fade-in-delay-2">
            <Link to="/signup">
              <button className="group px-8 py-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center space-x-2">
                <span className="text-lg">Get Started</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
            <Link to="/demo">
              <button className="px-8 py-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 text-lg">
                Watch Demo
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 animate-fade-in-delay-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-fade-in-delay-1 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.2s forwards;
        }
        
        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.4s forwards;
        }
        
        .animate-fade-in-delay-3 {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.6s forwards;
        }
      `}</style>
    </div>
  );
};

export default Hero;