import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, getStoredToken, setStoredToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((res) => setProfile(res.data))
      .catch(() => {
        setStoredToken(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setStoredToken(null);
      setProfile(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    setStoredToken(data.token);
    setProfile(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password });
    setStoredToken(data.token);
    setProfile(data.user);
    return data;
  };

  const logout = () => {
    setStoredToken(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await authApi.getMe();
      setProfile(data);
      return data;
    } catch (err) {
      return null;
    }
  };

  const value = {
    profile,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isLoggedIn: !!profile,
    isAdmin: profile?.role === 'ADMIN',
    isManager: profile?.role === 'MANAGER' || profile?.role === 'ADMIN',
    canManageProjects: profile?.role === 'ADMIN' || profile?.role === 'MANAGER',
    canDeleteProjects: profile?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
