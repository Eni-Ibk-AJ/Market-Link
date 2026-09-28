import { useEffect, useState } from 'react';
import { clearSession, saveSession, TOKEN_KEY, USER_KEY } from '../services/api';
import { AuthContext } from './authContextValue';

function readSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return token && user ? { token, user } : { token: null, user: null };
  } catch {
    clearSession();
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    function syncSession(event) {
      if (!event.key || event.key === TOKEN_KEY || event.key === USER_KEY) {
        setSession(readSession());
      }
    }

    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  function login(payload) {
    saveSession(payload);
    setSession({ token: payload.token, user: payload.user });
  }

  function logout() {
    clearSession();
    setSession({ token: null, user: null });
  }

  return <AuthContext.Provider value={{ ...session, isAuthenticated: Boolean(session.token && session.user), login, logout }}>{children}</AuthContext.Provider>;
}
