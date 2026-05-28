import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/endpoints';

interface StudentUser {
  id: number;
  name: string;
  studentNo: string;
  totalEarned: number;
  totalSpent: number;
}

interface AdminUser {
  id: number;
  username: string;
  role: string;
}

type User = StudentUser | AdminUser;

interface AuthState {
  user: User | null;
  token: string | null;
  role: 'student' | 'admin' | null;
  login: (role: 'student' | 'admin', credentials: Record<string, string>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [role, setRole] = useState<'student' | 'admin' | null>(() => {
    const r = localStorage.getItem('role');
    return r as 'student' | 'admin' | null;
  });

  const login = useCallback(async (loginRole: 'student' | 'admin', credentials: Record<string, string>) => {
    let result;
    if (loginRole === 'student') {
      result = await authApi.studentLogin(credentials.name, credentials.studentNo);
    } else {
      result = await authApi.adminLogin(credentials.username, credentials.password);
    }

    const { token: newToken, student, admin } = result.data;
    const userData = student || admin;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', loginRole);

    setToken(newToken);
    setUser(userData);
    setRole(loginRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
