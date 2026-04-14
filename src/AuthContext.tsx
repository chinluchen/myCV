import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: { uid: string; displayName: string; email: string } | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  role: null, 
  loading: true,
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; displayName: string; email: string } | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 監聽 Firebase 驗證狀態 (GitHub 登入)
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
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
