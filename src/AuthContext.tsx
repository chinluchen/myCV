import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: { uid: string; displayName: string; email: string } | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null, 
  loading: true,
  login: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; displayName: string; email: string } | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setRole('admin');
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pass: string) => {
    if (username === 'chinluchen' && pass === '0322') {
      const adminUser = { 
        uid: 'manual-admin-id', 
        displayName: 'chinluchen', 
        email: 'admin@local.host' 
      };
      setUser(adminUser);
      setRole('admin');
      localStorage.setItem('auth_user', JSON.stringify(adminUser));
    } else {
      throw new Error('帳號或密碼錯誤');
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
