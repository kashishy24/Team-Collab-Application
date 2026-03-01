import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RequireTeam({ children }) {
  const { profile, loading } = useAuth();

  if (loading || !profile) return null;
  if (!profile.teamId) {
    return <Navigate to="/setup-team" replace />;
  }
  return children;
}
