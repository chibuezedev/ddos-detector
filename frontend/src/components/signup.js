import React, {  useState, createContext, useContext} from 'react';
import {  useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alertComponent";
import Button  from './ui/buttonComponent';
import Input from './ui/inputComponent';



const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

  
  // Signup Page
  const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [error, setError] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const email = e.target.email.value;
        const password = e.target.password.value;
        const name = e.target.name.value;
        await signup(email, password, name);
        navigate('/dashboard');
      } catch (err) {
        setError('Signup failed');
      }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create NetGuard Account</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="name">Full Name</label>
                <Input id="name" type="text" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input id="email" type="email" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <Input id="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit">Sign Up</Button>
              <Link to="/login" className="text-sm text-blue-500 hover:underline">
                Already have an account?
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  };
  

  export default SignupPage