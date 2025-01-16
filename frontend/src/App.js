import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
} from "react-router-dom";
import { Shield, Menu, X, Mail, Lock, User, Loader2 } from "lucide-react";

import NetworkDashboard from "./components/dashboard";
import Sidebar from "./components/sidebar";
import Button from "./components/ui/buttonComponent";
import Analyze from "./components/analyse";
import Hero from "./components/home";
import { Card, CardContent, CardFooter } from "./components/ui/card";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "./components/ui/alertComponent";
import Input from "./components/ui/inputComponent";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = localStorage.getItem("user");
        if (session) {
          try {
            const parsedUser = JSON.parse(session);
            // Optional: Validate the user object structure
            if (parsedUser && typeof parsedUser === "object") {
              setUser(parsedUser);
            } else {
              // Invalid user object structure, clear localStorage
              localStorage.removeItem("user");
            }
          } catch (parseError) {
            console.error("Failed to parse user session:", parseError);
            // Clear invalid JSON from localStorage
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });
      const userData = response.data.user;

      // Validate user data before storing
      if (userData && typeof userData === "object") {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error("Invalid user data received from server");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still set user to null even if localStorage clear fails
      setUser(null);
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await axios.post("http://localhost:3001/signup", {
        email,
        password,
        name,
      });
      const userData = response.data.user;

      // Validate user data before storing
      if (userData && typeof userData === "object") {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error("Invalid user data received from server");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

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
              <span className="font-bold text-xl">NetPack</span>
            </Link>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-slate-950 from-neutral-800">
                {user.name}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                {/* <LogOut className="h-4 w-4" /> */}
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center space-x-2 mb-8 group">
          <Shield className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Detective
          </span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      <Card className="w-full shadow-lg border-0 ring-1 ring-gray-200">
        {children}
      </Card>
    </div>
  </div>
);

const InputField = ({ icon: Icon, label, ...props }) => (
  <div className="space-y-1.5">
    <label
      htmlFor={props.id}
      className="text-sm font-medium text-gray-700 block"
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <Input {...props} className="pl-10" />
    </div>
  </div>
);

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name);
      navigate("/dashboard");
    } catch (err) {
      setError("Signup failed. Please check your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join thousands of security professionals using Detective"
    >
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <InputField
            icon={User}
            label="Full Name"
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />

          <InputField
            icon={Mail}
            label="Email"
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <InputField
            icon={Lock}
            label="Password"
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <InputField
            icon={Lock}
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 px-6 pb-6">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-14 h-4 mr-2 animate-spin" />
            ) : (
              <>Create Account</>
            )}
          </Button>
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Already have an account? Log In
            </Link>
          </div>
        </CardFooter>
      </form>
    </AuthLayout>
  );
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Secure your network with Detective"
    >
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <InputField
            icon={Mail}
            label="Email"
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <InputField
            icon={Lock}
            label="Password"
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 px-6 pb-6">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <>Login</>
            )}
          </Button>
          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Need an account? Sign Up
            </Link>
          </div>
        </CardFooter>
      </form>
    </AuthLayout>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <NetworkDashboard />
              </Layout>
            }
          />
          <Route
            path="/analyze"
            element={
              <Layout>
                {" "}
                <Analyze />
              </Layout>
            }
          />
          <Route path="/" element={<Hero />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
