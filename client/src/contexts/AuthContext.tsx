import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  badges?: Array<{
    name: string;
    description?: string;
    awardedAt: Date;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile with token
  const fetchUserProfile = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setToken(null);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token: authToken, user: userData } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', authToken);
      
      // Update state
      setToken(authToken);
      setUser(userData);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      const { token: authToken, user: userData } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', authToken);
      
      // Update state
      setToken(authToken);
      setUser(userData);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  // Google login function
  const googleLogin = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/google`, {
        idToken
      });
      
      const { token: authToken, user: userData } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', authToken);
      
      // Update state
      setToken(authToken);
      setUser(userData);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Google authentication failed');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 