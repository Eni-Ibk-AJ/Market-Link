import { useContext } from 'react';
import { AuthContext } from './authContextValue';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function getDashboardPath(role) {
  if (role === 'farmer') return '/vendor';
  if (role === 'admin') return '/admin';
  return '/dashboard';
}