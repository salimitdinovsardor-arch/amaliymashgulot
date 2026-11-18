import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notification management
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', title = '') => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, title }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  // Check current session on application launch
  const checkAuthStatus = useCallback(async () => {
    try {
      const data = await authService.getMe();
      if (data && data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 simply means guest/unauthenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();

    // Listen for automatic token refresh failures
    const handleSessionExpired = () => {
      setUser(null);
      addToast('Your session has expired. Please sign in again.', 'warning', 'Session Expired');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [checkAuthStatus, addToast]);

  // Register
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      if (data.success && data.user) {
        setUser(data.user);
        addToast(data.message || 'Account created successfully!', 'success', 'Welcome to EduHub');
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      addToast(msg, 'error', 'Registration Error');
      return { success: false, message: msg };
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      if (data.success && data.user) {
        setUser(data.user);
        addToast(data.message || 'Logged in successfully!', 'success', 'Welcome Back');
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password.';
      addToast(msg, 'error', 'Login Failed');
      return { success: false, message: msg };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      addToast('You have been signed out safely.', 'info', 'Logged Out');
    } catch (error) {
      // Clear client state even if backend network failed
      setUser(null);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData);
      if (data.success && data.user) {
        setUser((prev) => ({ ...prev, ...data.user }));
        addToast(data.message || 'Profile updated successfully!', 'success', 'Saved');
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      addToast(msg, 'error', 'Update Failed');
      return { success: false, message: msg };
    }
  };

  // Change password
  const changePassword = async (passwords) => {
    try {
      const data = await authService.changePassword(passwords);
      if (data.success) {
        addToast(data.message || 'Password changed successfully!', 'success', 'Security Updated');
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password.';
      addToast(msg, 'error', 'Password Change Failed');
      return { success: false, message: msg };
    }
  };

  // Refresh user data (e.g. after course enrollment)
  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data && data.success && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    toasts,
    addToast,
    removeToast,
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

