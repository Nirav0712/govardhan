import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { adminApi } from "../services/api";

const Adminlogin = () => {
  const [loginData, setLoginData] = useState({
    email: "admin@govardhanthal.com",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors

    try {
      const response = await adminApi.login(loginData.email, loginData.password);
      const data = response.data;

      if (data.success) {
        localStorage.setItem("govardhanthal_admin_authenticated", data.data.token);
        localStorage.setItem("govardhanthal_admin_user", JSON.stringify(data.data.user));

        window.dispatchEvent(new CustomEvent("adminLoginSuccess"));

        toast.success("Login successful! Welcome to Admin Dashboard", {
          position: "top-right",
          autoClose: 3000
        });

        navigate("/admin/dashboard");
      } else {
        // Set inline error message for wrong credentials
        setError("Invalid email or password. Please try again.");
        
        // Also show toast for additional feedback
        toast.error(data.message || "Login failed. Please check your credentials.", {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Set inline error for network issues
      setError("Network error. Please check your connection and try again.");
      
      // Also show toast for additional feedback
      toast.error("Network error. Please check your connection and try again.", {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-orange-600 py-6 px-4 text-white text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-orange-200">Govardhan Thal Restaurant</p>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Lock size={28} className="text-orange-600" />
            </div>
          </div>

          <p className="text-center text-gray-600 mb-6">
            Enter your credentials to access the admin dashboard
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 border rounded-lg px-4 py-2 focus:ring-2 focus:outline-none ${
                    error 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                  placeholder="admin@govardhanthal.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 border rounded-lg px-4 py-2 focus:ring-2 focus:outline-none ${
                    error 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {/* Error message display */}
              {error && (
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-md text-white font-semibold flex items-center justify-center
                ${isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}
                transition-colors`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <a
          href="/"
          className="text-orange-600 hover:text-orange-800 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default Adminlogin;
