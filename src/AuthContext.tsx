import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: { uid: string; displayName: string; email: string; isManual?: boolean } | null;
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
    // 1. 檢查手動登入的 SessionStorage (僅限當前分頁)
    const savedUser = sessionStorage.getItem('auth_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setRole('admin');
      setLoading(false);
      return;
    }

    // 2. 監聽 Firebase 驗證狀態 (GitHub 登入)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const adminUIDs = ['KqkRBETa9iXigqtgn0EILGXcl1V2'];
        const isAdminUID = adminUIDs.includes(firebaseUser.uid);
        const isGitHubAdmin = firebaseUser.providerData.some(p => 
          p.providerId === 'github.com' && 
          (p.displayName?.toLowerCase() === 'chinluchen' || firebaseUser.displayName?.toLowerCase() === 'chinluchen')
        );

        const isAdmin = isAdminUID || isGitHubAdmin;
        
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'User',
          email: firebaseUser.email || ''
        });
        setRole(isAdmin ? 'admin' : 'user');
      } else {
        // 只有在沒有手動登入的情況下才清除狀態
        if (!sessionStorage.getItem('auth_user')) {
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, pass: string) => {
    if (username === 'chinluchen' && pass === '0322') {
      // 嘗試匿名登入以獲取 Firebase Session
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Anonymous login failed", e);
      }

      const adminUser = { 
        uid: 'manual-admin-id', 
        displayName: 'chinluchen', 
        email: 'admin@local.host',
        isManual: true
      };
      setUser(adminUser);
      setRole('admin');
      sessionStorage.setItem('auth_user', JSON.stringify(adminUser));
    } else {
      throw new Error('帳號或密碼錯誤');
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setRole(null);
    sessionStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
