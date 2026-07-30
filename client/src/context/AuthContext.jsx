import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await authService.getMe();
        setUser(data.data || data.user || data);
      } catch {
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem('accessToken', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password, inviteToken) => {
    setError(null);
    try {
      const { data } = await authService.register({ name, email, password, inviteToken });
      localStorage.setItem('accessToken', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // proceed with local logout even if API call fails
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setError(null);
      navigate('/');
    }
  }, [navigate]);

  const updateUser = useCallback((data) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
