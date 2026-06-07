import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

// Automatically detect host IP/name to support mobile debugging on local networks
export const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://crookshanks-production.up.railway.app';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem('crookshanks_token');
    const savedUser = localStorage.getItem('crookshanks_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const requestOtp = async (phoneNumber) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request OTP');
      }
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const verifyOtp = async (phoneNumber, otpCode) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // Store in state and localStorage
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('crookshanks_token', data.token);
      localStorage.setItem('crookshanks_user', JSON.stringify(data.user));

      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const updateProfile = async (newUsername) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data.user);
      localStorage.setItem('crookshanks_user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('crookshanks_token');
    localStorage.removeItem('crookshanks_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        requestOtp,
        verifyOtp,
        updateProfile,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
