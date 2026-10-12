import { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Exported so useAuth.js can consume it. This file deliberately contains only the
// provider, keeping component/hook concerns in separate modules.
export default AuthContext;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // When any request fails with a genuinely dead token, drop the session and
  // send the user back to the login screen.
  useEffect(() => {
    api.onUnauthorized = () => {
      localStorage.removeItem('token');
      api.clearToken();
      setUser(null);
      navigate('/login', { replace: true });
    };
    return () => {
      api.onUnauthorized = null;
    };
  }, [navigate]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      try {
        const response = await api.getMe();
        if (response.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          api.clearToken();
        }
      } catch {
        localStorage.removeItem('token');
        api.clearToken();
      }
    }
    setLoading(false);
  }, []);

  // Restore the session on first mount. This is a one-off data fetch from
  // localStorage + the API, not derived state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session bootstrap
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const response = await api.login({ email, password });
    if (response.success) {
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      api.setToken(token);
      setUser(user);
      return { success: true, role: user.role };
    }
    return { success: false, message: response.message };
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    if (response.success) {
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      api.setToken(token);
      setUser(user);
      return { success: true, role: user.role };
    }
    return { success: false, message: response.message, errors: response.errors };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    api.clearToken();
    setUser(null);
    navigate('/login');
  };

  const updateProfile = async (data) => {
    const response = await api.updateProfile(data);
    if (response.success) {
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const changePassword = async (data) => {
    const response = await api.changePassword(data);
    if (response.success) {
      const { token } = response.data;
      localStorage.setItem('token', token);
      api.setToken(token);
      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
